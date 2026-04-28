# Maven POM Editor

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=Bokix.maven-pom-editor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

一个 VS Code 扩展，专为 Maven 项目的 POM 文件提供可视化编辑和依赖管理功能。通过直观的界面查看依赖层次结构、快速排除冲突依赖，让 Maven 依赖管理变得简单高效。

## ✨ 功能特性

### 🔍 依赖管理
- **依赖层次可视化**: 树形展示项目的所有依赖关系及其传递依赖
- **依赖过滤**: 快速搜索和筛选特定的依赖项，支持 groupId、artifactId 和 version 搜索
- **冲突检测**: 自动识别并标记版本冲突、重复和循环依赖
- **左右联动**: 点击依赖树节点自动定位到已解析依赖列表，反之亦然

### 🎨 POM 辅助视图
- **Effective POM 查看**: 查看 Maven 解析后的完整配置，理解继承和属性替换的最终结果
- **编辑器集成**: 在 VS Code 原生编辑器中编辑 POM，保留所有语言功能和扩展支持
- **右键定位**: 在依赖视图中右键点击依赖，可直接在主编辑器中定位到对应 XML 节点

### 🚀 用户体验
- **工具栏按钮**: 打开 `pom.xml` 后，点击编辑器右上角按钮即可打开辅助视图
- **选项卡切换**: 在 "Effective POM" 和 "Dependency Hierarchy" 视图之间无缝切换
- **响应式界面**: 自适应布局，支持不同窗口大小
- **智能缓存**: Maven 命令结果缓存，避免重复解析，支持手动刷新

## 📸 功能展示

### 依赖层次可视化
![依赖层次结构](images/dependency-hierarchy.png)
*树形展示项目的所有依赖关系及其传递依赖，直观了解依赖结构*

### 依赖搜索与过滤
![依赖搜索功能](images/dependency-search.png)
*快速搜索和定位特定的依赖项，支持实时过滤*

## 📦 安装

### 从 Marketplace 安装
1. 打开 VS Code
2. 按 `Ctrl+Shift+X` (Windows/Linux) 或 `Cmd+Shift+X` (macOS) 打开扩展面板
3. 搜索 "Maven POM Editor"
4. 点击 "安装"

### 从 VSIX 文件安装
```bash
code --install-extension maven-pom-editor-0.1.0.vsix
```

## 🎯 使用方法

### 打开 POM 辅助视图
1. 在项目中打开任意 `pom.xml` 文件
2. 点击编辑器右上角的 **"Open Maven POM View"** 按钮（方块图标）
3. 或使用编辑器右键菜单中的 **"Open Maven POM View"**
4. 右侧会打开辅助面板，包含 "Effective POM" 和 "Dependency Hierarchy" 两个标签页

### 功能使用

#### 查看依赖树
1. 打开 POM 辅助视图后，点击 "Dependency Hierarchy" 选项卡
2. 展开依赖节点查看传递依赖
3. 使用顶部搜索框过滤特定依赖
4. 点击左栏树节点，右栏会自动高亮对应依赖；点击右栏依赖，左栏会过滤显示相关路径

#### 在编辑器中定位依赖
1. 在依赖树或已解析依赖列表中右键点击某个依赖
2. 选择 "在编辑器中定位"
3. 主编辑器会自动滚动并定位到该依赖在 `pom.xml` 中的位置

#### 查看 Effective POM
1. 点击 "Effective POM" 选项卡
2. 查看 Maven 解析后的完整配置
3. 支持语法高亮和代码折叠

## 📋 系统要求

### 必需
- **VS Code**: 1.80.0 或更高版本
- **Maven**: 本地安装 Maven 3.x 或更高版本（用于解析依赖信息）
- **操作系统**: Windows、macOS 或 Linux

### 推荐
- **Java**: JDK 8 或更高版本（Maven 运行所需）
- 将 Maven 添加到系统 PATH 环境变量

## ⚙️ 配置

暂无需额外配置，扩展会自动检测系统中的 Maven 安装。

## 🐛 已知问题

- 对于非常大的项目（超过 1000 个依赖），依赖树加载可能需要较长时间
- 在某些情况下，Maven 命令执行可能因权限问题失败
- 当前版本不支持多模块项目的聚合视图

如发现其他问题，请在 [GitHub Issues](https://github.com/bokix/maven-pom-editor.git/issues) 中报告。

## 🔄 版本历史

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本变更历史。

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 强大的代码编辑器
- [VS Code Extension API](https://code.visualstudio.com/api) - 扩展开发框架
- [Maven](https://maven.apache.org/) - 项目依赖管理工具

## 📞 支持

- 🐛 [报告问题](https://github.com/bokix/maven-pom-editor.git/issues)
- 💬 [讨论区](https://github.com/bokix/maven-pom-editor.git/discussions)
- 📧 联系邮箱: bokix.sun@gmail.com

---

**享受使用 Maven POM Editor！** 如果觉得有用，请在 [Marketplace](https://marketplace.visualstudio.com/items?itemName=Bokix.maven-pom-editor) 上给我们⭐️评分！

