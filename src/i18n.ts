import * as vscode from 'vscode';

export type Locale = 'en' | 'zh-cn';

let cachedLocale: Locale | undefined;

export function getLocale(): Locale {
    if (cachedLocale) {
        return cachedLocale;
    }
    const language = vscode.env.language.toLowerCase();
    cachedLocale = language.startsWith('zh') ? 'zh-cn' : 'en';
    return cachedLocale;
}

export function t(key: string, ...args: any[]): string {
    const locale = getLocale();
    const dict = translations[locale];
    let text = dict[key] ?? translations['en'][key] ?? key;

    // Simple parameter interpolation: {0}, {1}, ...
    args.forEach((arg, index) => {
        text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
    });

    return text;
}

const translations: Record<Locale, Record<string, string>> = {
    'en': {
        // Common
        'error.mavenNotFound': 'Maven is not installed or not added to PATH. Please install Maven and try again.',
        'error.mavenNotFoundWithWrapper': 'Maven not found. Tried Maven Wrapper and system PATH.\n\nSolutions:\n1. Ensure this project has mvnw (Maven Wrapper)\n2. Set mavenPomEditor.mavenPath in Settings',
        'error.wrapperNotExecutable': 'Maven Wrapper found but not executable: {0}\n\nRun: chmod +x {0}',
        'error.readPomFailed': 'Failed to read POM file: {0}',
        'error.locateFailed': 'Locate failed: {0}',
        'error.mavenCommandFailed': 'Failed to execute Maven command. Please ensure Maven is installed and added to system PATH.',
        'error.network': '{0} failed: Network connection issue. This may be caused by unstable network or restricted access to Maven Central. Please check your network or try again later.',
        'error.dependencyResolve': '{0} failed: Dependency resolution error. Please check the dependency configuration in POM file, or try cleaning the local Maven repository cache.',
        'error.permission': '{0} failed: Insufficient permissions. Please check file access permissions.',
        'error.generic': '{0} failed: {1}',
        'error.notFoundInPom': 'Dependency not found in POM file: {0}:{1}',

        // Progress
        'progress.checkMaven': 'Checking Maven environment',
        'progress.resolveDependencies': 'Resolving dependencies',
        'progress.generateEffectivePom': 'Generating Effective POM',
        'progress.generateDependencyTree': 'Generating dependency tree',
        'progress.generateDependencyList': 'Generating dependency list',
        'progress.processResult': 'Processing results',

        // Extension messages
        'msg.openPomFirst': 'Please open a pom.xml file first',
        'msg.notPomFile': 'The current file is not a pom.xml',
        'msg.usingWrapper': 'Using Maven Wrapper: {0}',
        'msg.usingConfigPath': 'Using configured Maven path: {0}',
        'msg.usingSystemMaven': 'Using system Maven: {0}',
        'msg.configureMavenPath': 'Configure Maven Path',
        'msg.cacheCleared': 'POM file updated, cache cleared',
        'msg.allCacheCleared': 'All Maven dependency caches cleared',
        'msg.cacheStats': 'Cache Statistics:\n• Memory cache: {0} items\n• WorkspaceState: {1} items\n• File cache: {2} items',

        // Task descriptions
        'task.clean': 'Clean project',
        'task.compile': 'Compile project',
        'task.test': 'Run tests',
        'task.package': 'Package project',
        'task.install': 'Install to local repository',
        'task.verify': 'Verify project',
        'task.cleanInstall': 'Clean and install',
        'task.cleanPackage': 'Clean and package',
        'task.dependencyTree': 'Show dependency tree',
        'task.dependencyList': 'List dependencies',

        // Webview UI (passed to frontend)
        'ui.effectivePom': 'Effective POM',
        'ui.dependencyHierarchy': 'Dependency Hierarchy',
        'ui.loadingEffectivePom': 'Loading Effective POM...',
        'ui.loadingHint': 'This may take a few seconds',
        'ui.loadingDependencyInfo': 'Loading dependency information...',
        'ui.loadingDependencyList': 'Loading dependency list...',
        'ui.waitingForTree': 'Waiting for dependency tree...',
        'ui.error.effectivePom': 'Failed to get Effective POM',
        'ui.error.dependencyTree': 'Failed to get dependency tree',
        'ui.error.resolvedList': 'Failed to get dependency list',
        'ui.retry': 'Retry',
        'ui.searchPlaceholder': 'Search dependencies (groupId:artifactId or keyword)...',
        'ui.clearSearch': 'Clear search',
        'ui.hideGroupId': 'Hide GroupId',
        'ui.showGroupId': 'Show GroupId',
        'ui.expandAll': 'Expand All',
        'ui.collapseAll': 'Collapse All',
        'ui.refresh': 'Refresh',
        'ui.treeTitle': 'Dependency Hierarchy',
        'ui.resolvedTitle': 'Resolved Dependencies',
        'ui.loading': 'Loading...',
        'ui.noDependencies': 'No dependencies found',
        'ui.noMatches': 'No matching dependencies',
        'ui.moreNodes': '... more nodes (click refresh to view all)',
        'ui.locateInEditor': 'Locate in Editor',
        'ui.omitted.conflict': 'conflict',
        'ui.omitted.duplicate': 'duplicate',
        'ui.omitted.cycle': 'cycle',
        'ui.omitted.managed': 'managed',
    },
    'zh-cn': {
        // Common
        'error.mavenNotFound': 'Maven 未安装或未添加到 PATH 中。请安装 Maven 后重试。',
        'error.mavenNotFoundWithWrapper': '未找到 Maven。已尝试 Maven Wrapper 和系统 PATH。\n\n解决方案:\n1. 确保本项目包含 mvnw (Maven Wrapper)\n2. 在设置中配置 mavenPomEditor.mavenPath',
        'error.wrapperNotExecutable': '发现 Maven Wrapper 但没有执行权限: {0}\n\n请运行: chmod +x {0}',
        'error.readPomFailed': '无法读取 POM 文件: {0}',
        'error.locateFailed': '定位失败: {0}',
        'error.mavenCommandFailed': '无法执行 Maven 命令。请确保已安装 Maven 并已添加到系统 PATH 中。',
        'error.network': '{0}失败：网络连接问题。这可能是由于网络不稳定或 Maven 中央仓库访问受限导致的。请检查网络连接或稍后重试。如果问题持续存在，请考虑配置 Maven 镜像源。',
        'error.dependencyResolve': '{0}失败：依赖解析错误。请检查 POM 文件中的依赖配置是否正确，或尝试清理本地 Maven 仓库缓存。',
        'error.permission': '{0}失败：权限不足。请检查文件访问权限。',
        'error.generic': '{0}失败：{1}',
        'error.notFoundInPom': '未在 POM 文件中找到依赖: {0}:{1}',

        // Progress
        'progress.checkMaven': '检查 Maven 环境',
        'progress.resolveDependencies': '解析依赖关系',
        'progress.generateEffectivePom': '生成 Effective POM',
        'progress.generateDependencyTree': '生成依赖树',
        'progress.generateDependencyList': '生成依赖列表',
        'progress.processResult': '处理结果',

        // Extension messages
        'msg.openPomFirst': '请先打开一个 pom.xml 文件',
        'msg.notPomFile': '当前文件不是 pom.xml',
        'msg.usingWrapper': '使用 Maven Wrapper: {0}',
        'msg.usingConfigPath': '使用配置的 Maven 路径: {0}',
        'msg.usingSystemMaven': '使用系统 Maven: {0}',
        'msg.configureMavenPath': '配置 Maven 路径',
        'msg.cacheCleared': 'POM 文件已更新，缓存已清除',
        'msg.allCacheCleared': '已清除所有 Maven 依赖缓存',
        'msg.cacheStats': '缓存统计:\n• 内存缓存: {0} 项\n• WorkspaceState: {1} 项\n• 文件缓存: {2} 项',

        // Task descriptions
        'task.clean': '清理项目',
        'task.compile': '编译项目',
        'task.test': '运行测试',
        'task.package': '打包项目',
        'task.install': '安装到本地仓库',
        'task.verify': '验证项目',
        'task.cleanInstall': '清理并安装',
        'task.cleanPackage': '清理并打包',
        'task.dependencyTree': '显示依赖树',
        'task.dependencyList': '列出依赖',

        // Webview UI
        'ui.effectivePom': 'Effective POM',
        'ui.dependencyHierarchy': 'Dependency Hierarchy',
        'ui.loadingEffectivePom': '正在获取 Effective POM...',
        'ui.loadingHint': '这可能需要几秒钟时间',
        'ui.loadingDependencyInfo': '正在获取依赖信息...',
        'ui.loadingDependencyList': '正在获取依赖列表...',
        'ui.waitingForTree': '等待依赖树加载完成...',
        'ui.error.effectivePom': '无法获取 Effective POM',
        'ui.error.dependencyTree': '无法获取依赖树',
        'ui.error.resolvedList': '无法获取依赖列表',
        'ui.retry': '重试',
        'ui.searchPlaceholder': '搜索依赖 (groupId:artifactId 或关键字)...',
        'ui.clearSearch': '清除搜索',
        'ui.hideGroupId': '隐藏 GroupId',
        'ui.showGroupId': '显示 GroupId',
        'ui.expandAll': '展开所有',
        'ui.collapseAll': '折叠所有',
        'ui.refresh': '刷新',
        'ui.treeTitle': 'Dependency Hierarchy',
        'ui.resolvedTitle': 'Resolved Dependencies',
        'ui.loading': '加载中...',
        'ui.noDependencies': '没有找到依赖',
        'ui.noMatches': '没有匹配的依赖',
        'ui.moreNodes': '... 更多节点 (点击刷新查看全部)',
        'ui.locateInEditor': '在编辑器中定位',
        'ui.omitted.conflict': '冲突',
        'ui.omitted.duplicate': '重复',
        'ui.omitted.cycle': '循环',
        'ui.omitted.managed': '托管',
    }
};

export function resetLocale(): void {
    cachedLocale = undefined;
}
