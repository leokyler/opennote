# OpenNote CLI

OpenCode 集成的笔记命令，用于快速创建结构化笔记。

OpenCode-integrated note commands for quick structured note creation.

## 概述 / Overview

OpenNote 为 OpenCode 提供预定义的笔记命令，简化常见笔记类型的创建流程。

OpenNote provides predefined note commands for OpenCode, streamlining the creation of common note types.

## 快速开始 / Quick Start

### 1. 安装 / Installation

```bash
# 全局安装（推荐）
npm install -g @repo/opennote
# 或
pnpm install -g @repo/opennote
```

### 2. 初始化 / Initialize

在您的项目目录中运行以下命令来安装 OpenNote 命令：

Run the following command in your project directory to install OpenNote commands:

```bash
opennote init
```

初始化成功后，您将看到已安装的命令列表和使用示例。

After successful initialization, you will see a list of installed commands and usage examples.

## 可用命令 / Available Commands

初始化后，以下命令将在 OpenCode 中可用：

After initialization, the following commands will be available in OpenCode:

### daily-note

创建包含优先级、任务和反思的结构化每日笔记。

Create a structured daily note with priorities, tasks, and reflections.

**使用方法 / Usage:**

```bash
opennote daily-note
```

### meeting-note

创建包含准备、讨论和后续跟进的综合会议笔记。

Create comprehensive meeting notes with preparation, discussion, and follow-ups.

**使用方法 / Usage:**

```bash
opennote meeting-note
```

### idea-note

使用结构化分析和实施规划捕获并发展想法。

Capture and develop ideas with structured analysis and implementation planning.

**使用方法 / Usage:**

```bash
opennote idea-note
```

### zettel-note

创建带有永久 ID 和网络思维的原子 Zettelkasten 卡片笔记。

Create atomic zettelkasten card notes with permanent IDs and networked thinking.

**使用方法 / Usage:**

```bash
opennote zettel-note
```

### project-note

创建包含目标、里程碑和资源的综合项目规划和跟踪笔记。

Create comprehensive project planning and tracking notes with goals, milestones, and resources.

**使用方法 / Usage:**

```bash
opennote project-note
```

### learning-note

通过概念、洞察和行动项记录学习，促进知识保留。

Document learning with concepts, insights, and action items for knowledge retention.

**使用方法 / Usage:**

```bash
opennote learning-note
```

## 高级用法 / Advanced Usage

### 强制重新初始化 / Force Re-initialization

如果需要重新初始化 OpenNote（例如，更新到新版本），使用 `--force` 选项：

If you need to re-initialize OpenNote (e.g., updating to a new version), use the `--force` option:

```bash
opennote init --force
```

### 查看版本 / View Version

```bash
opennote --version
# 或
opennote -V
```

### 查看帮助 / View Help

```bash
opennote --help
# 或
opennote -h
```

## 命令文件位置 / Command File Location

OpenNote 命令存储在项目根目录的 `.opencode/commands/` 目录中：

OpenNote commands are stored in the `.opencode/commands/` directory in your project root:

```
your-project/
├── .opencode/
│   ├── commands/
│   │   ├── daily-note.md
│   │   ├── meeting-note.md
│   │   ├── idea-note.md
│   │   ├── zettel-note.md
│   │   ├── project-note.md
│   │   └── learning-note.md
│   └── opennote-state.json
└── ...
```

## 状态管理 / State Management

OpenNote 使用 `.opencode/opennote-state.json` 文件跟踪安装状态：

OpenNote uses the `.opencode/opennote-state.json` file to track installation status:

- `initialized`: 是否已初始化 / Whether initialized
- `version`: 命令集版本 / Command set version
- `installedAt`: 安装时间 / Installation time
- `commands`: 已安装命令列表 / List of installed commands

## 故障排除 / Troubleshooting

### 权限错误 / Permission Errors

如果您遇到权限错误，请检查项目目录的写权限：

If you encounter permission errors, check write permissions for your project directory:

```bash
# Linux/Mac
ls -la
chmod -R u+w .opencode/

# Windows（以管理员身份运行命令提示符）
# Run Command Prompt as Administrator
```

### 损坏的状态 / Corrupted State

如果状态文件损坏，使用 `--force` 选项重新初始化：

If the state file is corrupted, re-initialize with the `--force` option:

```bash
opennote init --force
```

### 命令未在 OpenCode 中显示 / Commands Not Showing in OpenCode

确保 OpenCode 正在监视 `.opencode/` 目录。重启 OpenCode 或刷新命令列表。

Ensure OpenCode is watching the `.opencode/` directory. Restart OpenCode or refresh the command list.

## 自定义命令 / Custom Commands

您可以修改 `.opencode/commands/` 目录中的命令文件来自定义命令行为：

You can customize command behavior by editing the command files in `.opencode/commands/` directory:

1. 打开命令文件（例如 `daily-note.md`）
2. 编辑模板内容和 frontmatter
3. OpenCode 将自动更新命令

4. Open the command file (e.g., `daily-note.md`)
5. Edit the template content and frontmatter
6. OpenCode will automatically update the command

## 技术栈 / Tech Stack

- [TypeScript](https://www.typescriptlang.org/) - 类型安全 / Type safety
- [Commander.js](https://commander.jstool.io/) - CLI 框架 / CLI framework
- [Vitest](https://vitest.dev/) - 测试框架 / Testing framework

## 开发 / Development

### 设置开发环境 / Setup Development Environment

```bash
# 克隆仓库 / Clone the repository
git clone https://github.com/leokyler/opennote.git
cd opennote

# 安装依赖 / Install dependencies
pnpm install

# 构建 / Build
pnpm build

# 运行测试 / Run tests
pnpm test
```

### 运行本地开发版本 / Run Local Development Version

```bash
# 进入 opennote 包目录 / Enter opennote package directory
cd packages/opennote

# 使用 tsx 运行（无需构建）/ Run with tsx (no build needed)
npx tsx src/cli.ts init

# 或使用 Node.js 运行构建后的版本 / Or run built version with Node.js
node dist/cli.js init
```

## 贡献 / Contributing

欢迎贡献！请查看 [贡献指南](../../CONTRIBUTING.md) 了解详情。

Contributions are welcome! Please see the [Contributing Guide](../../CONTRIBUTING.md) for details.

## 许可证 / License

MIT

## 灵感 / Inspiration

受 [OpenWork](https://github.com/different-ai/openwork) 启发，将笔记功能深度集成到 OpenCode 工作流中。

Inspired by [OpenWork](https://github.com/different-ai/openwork), deeply integrating note-taking functionality into OpenCode workflow.
