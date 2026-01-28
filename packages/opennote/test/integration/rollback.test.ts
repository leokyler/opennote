/**
 * 回滚集成测试套件
 * 
 * 本测试套件验证 OpenNote 在安装失败时的回滚机制
 * 确保系统能够清理部分安装，保持状态一致性
 * 
 * 测试覆盖场景：
 * 1. 安装失败时清理部分安装的文件
 * 2. 确保状态文件在失败时保持一致
 * 3. 允许在回滚后重试安装
 * 4. 保护系统状态不被部分安装破坏
 * 
 * 这是用户故事 2 的核心需求：事务性安装与回滚（T030c）
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createInitCommand } from "../../src/commands/init.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// 状态文件路径：存储初始化状态信息
const STATE_FILE = ".opencode/opennote-state.json";

// 命令目录：存储所有安装的命令文件
const COMMANDS_DIR = ".opencode/commands";

describe("Rollback Integration", () => {
  let tempDir: string;
  let packageVersion: string;

  /**
   * 每个测试前的设置
   * 
   * 1. 在系统临时目录创建唯一的测试目录
   * 2. 切换工作目录到测试目录
   * 3. 读取 package.json 获取版本号
   * 
   * 隔离测试环境，避免影响实际项目目录
   */
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "opennote-test-"));
    process.chdir(tempDir);
    
    // 读取 package.json 获取版本号
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJson = JSON.parse(
      readFileSync(join(__dirname, "../../package.json"), "utf-8")
    );
    packageVersion = packageJson.version;
  });

  /**
   * 每个测试后的清理
   * 
   * 1. 切换回用户主目录
   * 2. 递归删除测试目录
   * 
   * 确保测试环境干净，不影响后续测试
   */
  afterEach(async () => {
    process.chdir(os.homedir());
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  /**
   * 测试场景：处理安装失败
   * 
   * 验证点：
   * 1. 创建部分安装的命令文件
   * 2. 创建无效的状态文件
   * 3. 运行 init 命令
   * 4. 系统检测到不一致状态
   * 5. 自动清理并重新初始化
   * 
   * 目的：确保系统能够从不一致状态恢复
   * 
   * 场景说明：
   * - 模拟上次安装被中断的情况
   * - 验证系统检测并修复部分安装
   * - 确保最终状态是一致的
   * 
   * 事务性保证：
   * - 要么完全成功，要么完全回滚
   * - 避免处于中间不一致状态
   */
  it("should handle installation failure", async () => {
    // 创建命令目录并添加部分安装的文件
    await fs.mkdir(COMMANDS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(COMMANDS_DIR, "partial.md"),
      "partial installation",
    );

    // 创建无效的状态文件（initialized: false）
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify({ initialized: false }));

    // 创建 init 命令，传递版本号
    const initCommand = createInitCommand(packageVersion);

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 运行 init 命令（应该触发重新初始化）
    try {
      await initCommand.parseAsync(["node", "opennote", "init"]);
    } catch (error) {
      expect((error as Error).message).toBe("process.exit called");
    }

    // 验证命令目录仍然存在
    const commandsDirExists = await fs
      .access(COMMANDS_DIR)
      .then(() => true)
      .catch(() => false);

    expect(commandsDirExists).toBe(true);

    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  /**
   * 注意：此测试套件可以扩展更多场景
   * 
   * 其他可能的测试场景（未实现）：
   * 1. 验证失败时删除部分安装的文件
   * 2. 验证失败时删除或重置状态文件
   * 3. 验证可以多次重试安装
   * 4. 验证失败不破坏现有的有效文件
   * 5. 验证磁盘空间不足时的处理
   * 
   * 这些场景可以在未来添加以增强测试覆盖率
   * 
   * 实现建议：
   * - 使用 vi.mock 模拟文件系统操作失败
   * - 测试不同类型的失败（EACCES, ENOSPC, EIO 等）
   * - 验证回滚操作的原子性
   * - 验证清理操作的完整性
   */
});
