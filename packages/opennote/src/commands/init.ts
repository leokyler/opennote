/**
 * OpenNote 初始化命令模块
 *
 * 本模块实现了 `opennote init` 命令，用于初始化 OpenNote 并安装预定义的笔记命令。
 *
 * 核心功能：
 * 1. 检查是否已初始化，避免重复安装
 * 2. 检测并处理损坏的安装状态
 * 3. 支持版本更新和强制重新初始化
 * 4. 提供错误处理和自动重试机制
 * 5. 确保安装过程的事务性和一致性
 *
 * 用户故事 2：优雅处理重新初始化（Priority: P2）
 * 任务 ID：T027, T028, T029, T030, T030a, T030b, T030c
 */

import { Command } from "commander";
import {
  isInitialized,
  loadState,
  saveState,
  isStateValid,
  needsUpdate,
} from "../utils/state-manager.js";
import { installCommands } from "../utils/command-installer.js";
import { PREDEFINED_COMMANDS } from "./index.js";
import { generateInitSuccessOutput } from "../utils/feedback.js";
import fs from "fs/promises";

/**
 * 状态文件路径
 *
 * 存储安装状态信息，包括：
 * - 是否已初始化（initialized）
 * - 版本号（version）
 * - 安装时间（installedAt）
 * - 已安装的命令列表（commands）
 */
const STATE_FILE = ".opencode/opennote-state.json";

/**
 * 命令目录路径
 *
 * 存储所有安装的命令文件（.md 格式）
 * OpenCode 会自动发现此目录中的命令文件
 */
const COMMANDS_DIR = ".opencode/commands";

/**
 * 初始化命令选项接口
 *
 * 定义 init 命令支持的命令行选项
 */
interface InitOptions {
  /**
   * 强制重新初始化
   *
   * 为 true 时，即使已初始化也会重新安装命令
   * 用于强制更新或修复损坏的安装
   */
  force?: boolean;
}

/**
 * 清理安装
 *
 * 删除整个 .opencode 目录及其所有内容
 *
 * 用途：
 * 1. 清理部分安装的文件
 * 2. 移除损坏的安装状态
 * 3. 为重新初始化准备干净的环境
 *
 * 事务性保证：
 * - 在安装失败时清理，确保系统处于一致状态
 * - 避免残留文件导致后续初始化问题
 *
 * 错误处理：
 * - 如果清理失败（如权限问题），记录警告但不抛出异常
 * - 避免清理失败掩盖原始错误
 */
async function cleanupInstallation(): Promise<void> {
  try {
    await fs.rm(".opencode", { recursive: true, force: true });
  } catch (error) {
    console.warn("Failed to cleanup installation:", error);
  }
}

/**
 * 判断是否为临时错误
 *
 * 检查错误是否为临时性、可重试的错误类型
 *
 * 临时错误类型：
 * - EAGAIN: 资源暂时不可用
 * - ECONNRESET: 网络连接重置
 * - ETIMEDOUT: 操作超时
 * - ENFILE: 系统打开文件数达到上限
 * - EMFILE: 进程打开文件数达到上限
 *
 * 也可以通过错误消息识别：
 * - 包含 "network" 的消息
 * - 包含 "timeout" 的消息
 * - 包含 "temporary" 的消息
 *
 * 参数：
 * @param error - 要检查的错误对象
 * @returns Promise<boolean> - 是否为临时错误
 */
async function isTransientError(error: Error): Promise<boolean> {
  const code = (error as NodeJS.ErrnoException).code;
  const message = error.message.toLowerCase();

  return (
    code === "EAGAIN" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "ENFILE" ||
    code === "EMFILE" ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("temporary")
  );
}

/**
 * 带重试机制的操作执行
 *
 * 对可能失败的异步操作执行重试，使用指数退避策略
 *
 * 重试策略：
 * - 最多重试次数：3 次（可配置）
 * - 退避算法：指数退避（2^attempt 秒）
 *   - 第 1 次失败：等待 1 秒
 *   - 第 2 次失败：等待 2 秒
 *   - 第 3 次失败：等待 4 秒
 *
 * 适用场景：
 * - 网络相关的临时错误
 * - 文件系统暂时不可用
 * - 资源暂时耗尽
 *
 * 不适用场景：
 * - 权限错误（EACCES）
 * - 磁盘空间不足（ENOSPC）
 * - 只读文件系统（EROFS）
 *
 * 参数：
 * @param operation - 要执行的异步操作函数
 * @param maxRetries - 最大重试次数，默认为 3
 * @returns Promise<T> - 操作成功的结果
 * @throws Error - 所有重试都失败后抛出最后一个错误
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 尝试执行操作
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // 检查是否为可重试的临时错误
      if (await isTransientError(lastError)) {
        // 计算退避延迟（毫秒）
        const delay = Math.pow(2, attempt) * 1000;

        console.warn(
          `Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`,
        );
        console.warn(`Error: ${lastError.message}`);

        // 等待退避时间后重试
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // 非临时错误，立即抛出
        throw lastError;
      }
    }
  }

  // 所有重试都失败，抛出最后一个错误
  throw lastError;
}

/**
 * 创建初始化命令
 *
 * 创建并返回 Commander.js 的 init 命令实例
 *
 * @param version - 包版本号，从 package.json 读取
 * @returns {Command} Commander.js 命令实例
 */
export function createInitCommand(version: string): Command {
  const initCommand = new Command("init")
    .description("Initialize OpenNote with predefined note commands")
    // 添加 --force 选项，用于强制重新初始化
    .option("--force", "Force re-initialization even if already initialized")
    .action(async (options: InitOptions) => {
      console.log("Initializing OpenNote...");

      try {
        // 检查初始化状态
        const initialized = await isInitialized();
        const stateValid = await isStateValid();

        /**
         * 场景 1：已初始化且状态有效，且未使用 --force 选项
         *
         * 行为：
         * 1. 检查是否有可用的更新
         * 2. 如果有更新，提示用户使用 --force
         * 3. 如果无更新，显示已初始化消息并退出
         */
        if (initialized && stateValid && !options.force) {
          const state = await loadState();

          // 检查版本是否需要更新
          if (state && needsUpdate(state.version, version)) {
            console.log(
              `OpenNote is initialized but can be updated (version ${state.version} → ${version}).`,
            );
            console.log("Run with --force to update.");
            return;
          }

          // 无需更新，显示已初始化消息
          console.log(
            `OpenNote is already initialized (version ${state?.version}).`,
          );
          console.log("No action taken. Commands remain available.");
          return;
        }

        /**
         * 场景 2：状态无效或使用 --force 选项
         *
         * 行为：
         * 1. 清理现有安装
         * 2. 重新初始化
         *
         * 触发条件：
         * - initialized=true 但 stateValid=false（状态损坏）
         * - options.force=true（用户强制重新初始化）
         */
        if ((initialized && !stateValid) || options.force) {
          console.log(
            "Detected corrupted state or forced re-initialization...",
          );
          // 清理部分安装或损坏的安装
          await cleanupInstallation();
        }

        /**
         * 核心安装流程（带重试机制）
         *
         * 步骤：
         * 1. 安装所有预定义命令到 .opencode/commands/
         * 2. 创建状态文件记录安装信息
         *
         * 重试机制确保：
         * - 临时网络或文件系统错误会自动重试
         * - 最多重试 3 次，使用指数退避策略
         */
        await retryOperation(async () => {
          // 安装命令文件
          await installCommands(PREDEFINED_COMMANDS);

          // 创建新的状态对象
          const newState = {
            initialized: true,
            version: version,
            installedAt: new Date().toISOString(),
            // 映射命令到注册信息
            commands: PREDEFINED_COMMANDS.map((cmd) => ({
              name: cmd.name,
              installedAt: new Date().toISOString(),
              version: version,
              source: "predefined" as const,
            })),
          };

          // 保存状态到文件
          await saveState(newState);
        });

        // 显示成功消息
        console.log(generateInitSuccessOutput(PREDEFINED_COMMANDS));
      } catch (error) {
        // 错误处理：根据错误类型提供不同的帮助信息
        const err = error as Error;
        const code = (err as NodeJS.ErrnoException).code;

        console.error("✗ Initialization failed:", err.message);

        /**
         * 错误类型 1：权限拒绝（EACCES）
         *
         * 提供详细的权限信息：
         * - 错误原因说明
         * - 需要权限的目录路径
         * - 需要权限的文件路径
         * - 清理部分安装
         */
        if (code === "EACCES" || err.message.includes("permission denied")) {
          console.error(
            "Error: Permission denied. Please check file/directory permissions.",
          );
          console.error(`  - Directory: ${process.cwd()}/${COMMANDS_DIR}`);
          console.error(`  - State file: ${process.cwd()}/${STATE_FILE}`);
          await cleanupInstallation();
        } else if (code === "ENOSPC" || err.message.includes("no space left")) {
          /**
           * 错误类型 2：磁盘空间不足（ENOSPC）
           *
           * 提供清理建议：
           * - 提示磁盘空间不足
           * - 清理部分安装
           */
          console.error("Error: Insufficient disk space.");
          await cleanupInstallation();
        } else if (code === "EROFS" || err.message.includes("read-only")) {
          /**
           * 错误类型 3：只读文件系统（EROFS）
           *
           * 提供文件系统信息：
           * - 提示文件系统只读
           * - 解释无法创建文件
           * - 清理部分安装
           */
          console.error("Error: Filesystem is read-only. Cannot create files.");
          await cleanupInstallation();
        } else {
          /**
           * 错误类型 4：其他错误
           *
           * 通用错误处理：
           * - 提示清理部分安装
           * - 退出并返回错误码 1
           */
          console.error("Cleaning up partial installation...");
          await cleanupInstallation();
        }

        // 以非零退出码终止进程
        process.exit(1);
      }
    });

  return initCommand;
}
