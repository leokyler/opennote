# OpenNote

A note-taking plugin and UI for OpenCode.

基于 OpenCode 的笔记插件和 UI。

## 概述 / Overview

OpenNote 是一个集成到 OpenCode 的笔记解决方案，灵感来自 OpenWork。计划包含：

- OpenCode commands (通过这个包提供)
- OpenCode skills (通过这个包提供)
- OpenCode 插件 (通过这个包提供)
- OpenCode 插件
- 响应式 UI 界面
- 基于 OpenCode 生态的笔记管理

OpenNote is an OpenCode-integrated note-taking solution inspired by OpenWork. Planned features include:

- OpenCode commands (Available through this package)
- OpenCode skills (Available through this package)
- OpenCode plugin (Available through this package)
- Responsive UI interface
- Note management based on OpenCode ecosystem

## 技术栈 / Tech Stack

- [Turborepo](https://turborepo.dev/) - Monorepo management / Monorepo 管理
- [TypeScript](https://www.typescriptlang.org/) - Type safety / 类型安全
- [Next.js](https://nextjs.org/) - Frontend framework / 前端框架
- [React](https://react.dev/) - UI library / UI 库

## 快速开始 / Quick Start

### 安装依赖 / Install Dependencies

```bash
pnpm install
```

### 开发模式 / Development

```bash
pnpm run dev
```

### 构建 / Build

```bash
pnpm run build
```

## 项目结构 / Project Structure

- `apps/web` - Main application / 主应用
- `apps/docs` - Documentation site / 文档站点
- `packages/ui` - Shared UI components / 共享 UI 组件
- `packages/eslint-config` - ESLint configuration / ESLint 配置
- `packages/typescript-config` - TypeScript configuration / TypeScript 配置

## 灵感 / Inspiration

受 [OpenWork](https://github.com/different-ai/openwork) 启发，将笔记功能深度集成到 OpenCode 工作流中。

Inspired by [OpenWork](https://github.com/different-ai/openwork), deeply integrating note-taking functionality into the OpenCode workflow.
