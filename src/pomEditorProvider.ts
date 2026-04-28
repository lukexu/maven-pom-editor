import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MavenUtils } from './mavenUtils';
import { CacheManager } from './cacheManager';
import { t, getLocale } from './i18n';

export class PomViewProvider {

    private panels: Map<string, vscode.WebviewPanel> = new Map();

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly cacheManager: CacheManager
    ) { }

    public openPomView(uri: vscode.Uri): void {
        const pomPath = uri.fsPath;
        const panelKey = pomPath;

        // 如果已经打开了对应的面板，就显示它
        const existingPanel = this.panels.get(panelKey);
        if (existingPanel) {
            existingPanel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        // 读取 POM 文件内容
        let pomContent = '';
        try {
            pomContent = fs.readFileSync(pomPath, 'utf-8');
        } catch (error) {
            vscode.window.showErrorMessage(t('error.readPomFailed', pomPath));
            return;
        }

        // 创建 WebviewPanel
        const panel = vscode.window.createWebviewPanel(
            'mavenPomEditor.view',
            t('ui.panelTitle', path.basename(path.dirname(pomPath))),
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            }
        );

        this.panels.set(panelKey, panel);

        // 面板关闭时清理
        panel.onDidDispose(() => {
            this.panels.delete(panelKey);
        });

        // 设置 Webview HTML
        panel.webview.html = this.getHtmlForWebview(panel.webview, pomContent);

        // 监听消息
        this.setupWebviewMessageListener(panel, uri);
    }

    private getHtmlForWebview(webview: vscode.Webview, pomContent: string): string {
        // Get the CSS and JS URIs
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'style.css')
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'main.js')
        );

        // Monaco Editor loader
        const monacoLoaderUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'monaco-loader.js')
        );

        // Use a nonce to only allow specific scripts to run
        const nonce = getNonce();

        // Detect current theme
        const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'vscode-dark' : 'vscode-light';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline' https://cdn.jsdelivr.net; font-src ${webview.cspSource} https://cdn.jsdelivr.net; script-src 'nonce-${nonce}' https://cdn.jsdelivr.net;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>Maven POM View</title>
</head>
<body class="${theme}">
    <div class="editor-container">
        <div class="tab-bar">
            <button class="tab-button active" data-tab="effective-pom">Effective POM</button>
            <button class="tab-button" data-tab="dependency-hierarchy">Dependency Hierarchy</button>
        </div>

        <div class="tab-content-container">
            <div id="effective-pom" class="tab-content active">
            </div>

            <div id="dependency-hierarchy" class="tab-content">
            </div>
        </div>
    </div>

    <div id="context-menu" class="context-menu">
        <div class="context-menu-item" id="context-menu-locate">${t('ui.locateInEditor')}</div>
    </div>

    <script nonce="${nonce}">
        const vscodeApi = acquireVsCodeApi();
        const initialContent = ${JSON.stringify(pomContent)};
        const locale = '${getLocale()}';
    </script>
    <script nonce="${nonce}" src="${monacoLoaderUri}"></script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    private setupWebviewMessageListener(
        panel: vscode.WebviewPanel,
        uri: vscode.Uri
    ): void {
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'log':
                        console.log('Webview:', message.content);
                        break;
                    case 'getEffectivePom':
                        await this.handleGetEffectivePom(panel, uri, message.forceRefresh);
                        break;
                    case 'getDependencyTree':
                        await this.handleGetDependencyTree(panel, uri, message.forceRefresh);
                        break;
                    case 'getResolvedDependencies':
                        await this.handleGetResolvedDependencies(panel, uri, message.forceRefresh);
                        break;
                    case 'locateInEditor':
                        await this.handleLocateInEditor(uri, message.groupId, message.artifactId);
                        break;
                }
            }
        );
    }

    private async handleGetEffectivePom(
        panel: vscode.WebviewPanel,
        uri: vscode.Uri,
        forceRefresh: boolean = false
    ): Promise<void> {
        await this.executeWithProgress(
            panel,
            uri,
            'effectivePom',
            forceRefresh,
            async (pomPath: string) => {
                await this.reportProgress(panel, 'effectivePom', 1, t('progress.checkMaven'));
                const mavenAvailable = await MavenUtils.isMavenAvailable(pomPath);
                if (!mavenAvailable) {
                    throw new Error(t('error.mavenNotFoundWithWrapper'));
                }

                await this.reportProgress(panel, 'effectivePom', 2, t('progress.resolveDependencies'));
                await this.reportProgress(panel, 'effectivePom', 3, t('progress.generateEffectivePom'));
                const effectivePom = await MavenUtils.getEffectivePom(pomPath);

                await this.reportProgress(panel, 'effectivePom', 4, t('progress.processResult'));

                return effectivePom;
            }
        );
    }

    private async handleGetDependencyTree(
        panel: vscode.WebviewPanel,
        uri: vscode.Uri,
        forceRefresh: boolean = false
    ): Promise<void> {
        await this.executeWithProgress(
            panel,
            uri,
            'dependencyTree',
            forceRefresh,
            async (pomPath: string) => {
                await this.reportProgress(panel, 'dependencyTree', 1, t('progress.checkMaven'));
                const mavenAvailable = await MavenUtils.isMavenAvailable(pomPath);
                if (!mavenAvailable) {
                    throw new Error(t('error.mavenNotFoundWithWrapper'));
                }

                await this.reportProgress(panel, 'dependencyTree', 2, t('progress.resolveDependencies'));
                await this.reportProgress(panel, 'dependencyTree', 3, t('progress.generateDependencyTree'));
                const treeText = await MavenUtils.getDependencyTree(pomPath);

                await this.reportProgress(panel, 'dependencyTree', 4, t('progress.processResult'));
                const treeData = MavenUtils.parseDependencyTree(treeText);

                return treeData;
            }
        );
    }

    private async handleGetResolvedDependencies(
        panel: vscode.WebviewPanel,
        uri: vscode.Uri,
        forceRefresh: boolean = false
    ): Promise<void> {
        await this.executeWithProgress(
            panel,
            uri,
            'resolvedDependencies',
            forceRefresh,
            async (pomPath: string) => {
                await this.reportProgress(panel, 'resolvedDependencies', 1, t('progress.checkMaven'));
                const mavenAvailable = await MavenUtils.isMavenAvailable(pomPath);
                if (!mavenAvailable) {
                    throw new Error(t('error.mavenNotFoundWithWrapper'));
                }

                await this.reportProgress(panel, 'resolvedDependencies', 2, t('progress.resolveDependencies'));
                await this.reportProgress(panel, 'resolvedDependencies', 3, t('progress.generateDependencyList'));
                const listText = await MavenUtils.getResolvedDependencies(pomPath);

                await this.reportProgress(panel, 'resolvedDependencies', 4, t('progress.processResult'));
                const dependencies = MavenUtils.parseResolvedDependencies(listText);

                return dependencies;
            }
        );
    }

    private async executeWithProgress<T>(
        panel: vscode.WebviewPanel,
        uri: vscode.Uri,
        cacheKey: string,
        forceRefresh: boolean,
        executor: (pomPath: string) => Promise<T>
    ): Promise<void> {
        const messageType = this.getMessageType(cacheKey);

        try {
            this.showLoadingState(panel, cacheKey, true);

            const pomPath = uri.fsPath;

            const cachedData = await this.cacheManager.get(pomPath, cacheKey, forceRefresh);
            if (cachedData) {
                console.log(`[PomView] 使用缓存的 ${cacheKey} 数据`);
                this.showCachedResult(panel, cacheKey, cachedData);
                return;
            }

            console.log(`[PomView] 从 Maven 获取 ${cacheKey}...`);

            const result = await executor(pomPath);

            await this.cacheManager.set(pomPath, cacheKey, result);

            panel.webview.postMessage({
                type: `${messageType}Result`,
                [this.getResultKey(cacheKey)]: result,
                loading: false,
                fromCache: false
            });
        } catch (error: any) {
            console.error(`获取 ${cacheKey} 失败:`, error);
            const errorMessage = error.message || t('error.generic', cacheKey);
            this.showError(panel, cacheKey, errorMessage);

            // 如果是 Maven 未找到的错误，提供配置指引
            if (errorMessage.includes(t('error.mavenNotFoundWithWrapper'))) {
                const result = await vscode.window.showErrorMessage(
                    errorMessage,
                    t('msg.configureMavenPath')
                );
                if (result === t('msg.configureMavenPath')) {
                    vscode.commands.executeCommand(
                        'workbench.action.openSettings',
                        'mavenPomEditor.mavenPath'
                    );
                }
            }
        }
    }

    private showLoadingState(panel: vscode.WebviewPanel, cacheKey: string, loading: boolean): void {
        const messageType = this.getMessageType(cacheKey);
        panel.webview.postMessage({
            type: `${messageType}Loading`,
            loading
        });
    }

    private showCachedResult(panel: vscode.WebviewPanel, cacheKey: string, data: any): void {
        const messageType = this.getMessageType(cacheKey);
        panel.webview.postMessage({
            type: `${messageType}Result`,
            [this.getResultKey(cacheKey)]: data,
            loading: false,
            fromCache: true
        });
    }

    private showError(panel: vscode.WebviewPanel, cacheKey: string, error: string): void {
        const messageType = this.getMessageType(cacheKey);
        panel.webview.postMessage({
            type: `${messageType}Error`,
            error,
            loading: false
        });
    }

    private async reportProgress(
        panel: vscode.WebviewPanel,
        cacheKey: string,
        step: number,
        message: string
    ): Promise<void> {
        const messageType = this.getMessageType(cacheKey);
        panel.webview.postMessage({
            type: `${messageType}Progress`,
            step,
            message,
            progress: step * 25
        });

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    private getMessageType(cacheKey: string): string {
        switch (cacheKey) {
            case 'effectivePom':
                return 'effectivePom';
            case 'dependencyTree':
                return 'dependencyTree';
            case 'resolvedDependencies':
                return 'resolvedDependencies';
            default:
                return cacheKey;
        }
    }

    private getResultKey(cacheKey: string): string {
        switch (cacheKey) {
            case 'effectivePom':
                return 'content';
            case 'dependencyTree':
            case 'resolvedDependencies':
                return 'data';
            default:
                return 'data';
        }
    }

    private async handleLocateInEditor(
        uri: vscode.Uri,
        groupId: string,
        artifactId: string
    ): Promise<void> {
        try {
            // 打开或显示 pom.xml 文件
            const document = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One);

            const text = document.getText();
            const groupIdPattern = `<groupId>${this.escapeRegex(groupId)}</groupId>`;
            const artifactIdPattern = `<artifactId>${this.escapeRegex(artifactId)}</artifactId>`;

            // 查找所有 groupId 匹配位置
            let bestRange: vscode.Range | undefined;
            let searchIndex = 0;

            while (true) {
                const groupIdIndex = text.indexOf(groupIdPattern, searchIndex);
                if (groupIdIndex === -1) {
                    break;
                }

                // 在该 groupId 附近查找 artifactId
                const startSearch = Math.max(0, groupIdIndex - 500);
                const endSearch = Math.min(text.length, groupIdIndex + 500);
                const nearbyText = text.substring(startSearch, endSearch);

                if (nearbyText.includes(artifactIdPattern)) {
                    // 找到了匹配的 groupId + artifactId 组合
                    const position = document.positionAt(groupIdIndex);
                    bestRange = new vscode.Range(position, position);
                    break;
                }

                searchIndex = groupIdIndex + 1;
            }

            // 如果没找到组合，尝试单独查找 artifactId
            if (!bestRange) {
                const artifactIdIndex = text.indexOf(artifactIdPattern);
                if (artifactIdIndex !== -1) {
                    const position = document.positionAt(artifactIdIndex);
                    bestRange = new vscode.Range(position, position);
                }
            }

            if (bestRange) {
                editor.revealRange(bestRange, vscode.TextEditorRevealType.InCenter);
                editor.selection = new vscode.Selection(bestRange.start, bestRange.start);
            } else {
                vscode.window.showInformationMessage(t('error.notFoundInPom', groupId, artifactId));
            }
        } catch (error: any) {
            console.error('定位到编辑器失败:', error);
            vscode.window.showErrorMessage(t('error.locateFailed', error.message));
        }
    }

    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
