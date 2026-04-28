import * as vscode from 'vscode';
import { PomViewProvider } from './pomEditorProvider';
import { CacheManager } from './cacheManager';
import { MavenTaskProvider } from './mavenTaskProvider';
import { t } from './i18n';

export function activate(context: vscode.ExtensionContext) {
    console.log('Maven POM Editor extension is now active');

    // 创建缓存管理器实例
    const cacheManager = new CacheManager(context);

    // Register the POM view provider
    const pomViewProvider = new PomViewProvider(context, cacheManager);

    // Register the open POM view command
    const openPomViewCommand = vscode.commands.registerCommand('mavenPomEditor.openPomView', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage(t('msg.openPomFirst'));
            return;
        }

        const document = activeEditor.document;
        if (!document.fileName.endsWith('pom.xml')) {
            vscode.window.showWarningMessage(t('msg.notPomFile'));
            return;
        }

        pomViewProvider.openPomView(document.uri);
    });
    context.subscriptions.push(openPomViewCommand);

    // 注册 Maven 任务提供者
    const taskProvider = new MavenTaskProvider();
    const taskProviderRegistration = vscode.tasks.registerTaskProvider(
        MavenTaskProvider.taskType,
        taskProvider
    );
    context.subscriptions.push(taskProviderRegistration);

    // Listen for POM file save events to auto-clear cache
    const fileWatcher = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.fileName.endsWith('pom.xml')) {
            await cacheManager.invalidate(document.uri.fsPath);
            vscode.window.showInformationMessage(t('msg.cacheCleared'));
        }
    });
    context.subscriptions.push(fileWatcher);

    // Register clear all cache command
    const clearCacheCommand = vscode.commands.registerCommand('mavenPomEditor.clearCache', async () => {
        await cacheManager.clearAll();
        vscode.window.showInformationMessage(t('msg.allCacheCleared'));
    });
    context.subscriptions.push(clearCacheCommand);

    // Register show cache stats command
    const showCacheStatsCommand = vscode.commands.registerCommand('mavenPomEditor.showCacheStats', async () => {
        const stats = await cacheManager.getStats();
        const message = t('msg.cacheStats', stats.memoryCount, stats.workspaceStateCount, stats.fileCount);
        vscode.window.showInformationMessage(message);
    });
    context.subscriptions.push(showCacheStatsCommand);

    // Start background preload
    scheduleBackgroundPreload(context, cacheManager);
}

export function deactivate() {
    console.log('Maven POM Editor extension is now deactivated');
}

function scheduleBackgroundPreload(context: vscode.ExtensionContext, cacheManager: CacheManager): void {
    setTimeout(() => {
        preloadMavenData(context, cacheManager);
    }, 2000);
}

async function preloadMavenData(context: vscode.ExtensionContext, cacheManager: CacheManager): Promise<void> {
    try {
        const pomFiles = await vscode.workspace.findFiles('**/pom.xml', '**/node_modules/**', 3);
        if (pomFiles.length === 0) {
            return;
        }
        await cacheManager.smartWarmup(context);
    } catch (error) {
        console.warn('[Extension] Background preload failed:', error);
    }
}
