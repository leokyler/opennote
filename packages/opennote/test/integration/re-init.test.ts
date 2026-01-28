/**
 * 重新初始化测试套件
 * 
 * 本测试套件验证 OpenNote 在重复运行 init 命令时的行为
 * 确保系统能够优雅地处理重复初始化，不产生错误或重复文件
 * 
 * 测试覆盖场景：
 * 1. 已初始化状态下再次运行 init
 * 2. 保留现有的安装状态和时间戳
 * 3. 保持命令文件的功能完整性
 * 4. 检测版本变化
 * 5. 防止创建重复的命令文件
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createInitCommand } from "../../src/commands/init.js";
import { loadState } from "../../src/utils/state-manager.js";
import { fileExists } from "../../src/utils/file-operations.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

// 状态文件路径：存储初始化状态信息
const STATE_FILE = ".opencode/opennote-state.json";

// 命令目录：存储所有安装的命令文件
const COMMANDS_DIR = ".opencode/commands";

describe("Re-initialization", () => {
  let tempDir: string;

  /**
   * 每个测试前的设置
   * 
   * 1. 在系统临时目录创建唯一的测试目录
   * 2. 切换工作目录到测试目录
   * 
   * 这样可以：
   * - 隔离每个测试的文件系统操作
   * - 避免污染实际项目目录
   * - 确保测试可重复执行
   */
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "opennote-test-"));
    process.chdir(tempDir);
  });

  /**
   * 每个测试后的清理
   * 
   * 1. 切换回用户主目录（释放测试目录）
   * 2. 递归删除测试目录及其所有内容
   * 
   * 确保测试环境干净，不影响后续测试
   */
  afterEach(async () => {
    process.chdir(os.homedir());
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  /**
   * 测试场景：已初始化状态下再次运行 init 命令
   * 
   * 验证点：
   * 1. 首次初始化成功，状态文件存在且有效
   * 2. 第二次运行时检测到已初始化状态
   * 3. 输出"already initialized"消息
   * 4. 不执行重复的安装操作
   * 
   * 这是用户故事 2 的核心需求：优雅处理重复初始化
   */
  it("should skip initialization when already initialized", async () => {
    const initCommand = createInitCommand();

    // 拦截 console.log 以捕获输出
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    
    // 拦截 process.exit 以防止测试进程终止
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 第一次运行：正常初始化
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证状态文件存在且初始化标记为 true
    const state = await loadState();
    expect(state).toBeDefined();
    expect(state?.initialized).toBe(true);

    // 清除之前的日志调用
    consoleLogSpy.mockClear();

    // 第二次运行：应该跳过初始化
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证输出包含"already initialized"消息
    const logCalls = consoleLogSpy.mock.calls.flat().join("\n");
    expect(logCalls).toContain("already initialized");

    // 恢复原始函数
    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  /**
   * 测试场景：保留现有状态的时间戳
   * 
   * 验证点：
   * 1. 首次初始化记录安装时间
   * 2. 重复初始化不修改原始时间戳
   * 
   * 目的：确保状态文件保持不变，证明重复初始化确实被跳过
   */
  it("should preserve existing state on re-initialization", async () => {
    const initCommand = createInitCommand();

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 第一次运行
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 获取原始安装时间戳
    const firstState = await loadState();
    const originalInstalledAt = firstState?.installedAt;

    // 等待一小段时间，确保时间戳差异可检测
    await new Promise((resolve) => setTimeout(resolve, 10));

    consoleLogSpy.mockClear();

    // 第二次运行
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证时间戳未改变
    const secondState = await loadState();
    expect(secondState?.installedAt).toBe(originalInstalledAt);

    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  /**
   * 测试场景：重复初始化后命令保持功能正常
   * 
   * 验证点：
   * 1. 首次初始化创建命令文件
   * 2. 重复初始化不增加命令文件数量
   * 3. 所有命令文件保持完整
   * 
   * 目的：确保重复初始化不会破坏或复制命令文件
   */
  it("should keep commands functional after re-initialization", async () => {
    const initCommand = createInitCommand();

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 第一次运行
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 统计命令文件数量
    const commandFiles = await fs.readdir(COMMANDS_DIR);
    const firstCommandCount = commandFiles.length;

    consoleLogSpy.mockClear();

    // 第二次运行
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证命令文件数量未增加
    const commandFilesAfter = await fs.readdir(COMMANDS_DIR);
    const secondCommandCount = commandFilesAfter.length;

    expect(secondCommandCount).toBe(firstCommandCount);

    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  /**
   * 测试场景：检测并显示版本信息
   * 
   * 验证点：
   * 1. 首次初始化保存版本号
   * 2. 重复初始化时显示当前版本信息
   * 
   * 目的：确保用户可以看到已安装的 OpenNote 版本
   */
  it("should detect version changes", async () => {
    const initCommand = createInitCommand();

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 第一次运行
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 获取安装的版本号
    const state = await loadState();
    const firstVersion = state?.version;

    consoleLogSpy.mockClear();

    // 第二次运行
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证输出包含版本信息
    const logCalls = consoleLogSpy.mock.calls.flat().join("\n");
    expect(logCalls).toContain(`version ${firstVersion}`);

    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  /**
   * 测试场景：不创建重复的命令文件
   * 
   * 验证点：
   * 1. 首次初始化创建命令文件
   * 2. 重复初始化不覆盖或复制命令文件
   * 3. 命令文件内容保持不变
   * 
   * 目的：确保不会创建重复的命令文件导致混乱
   */
  it("should not create duplicate command files on re-initialization", async () => {
    const initCommand = createInitCommand();

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 第一次运行
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 读取命令文件内容
    const dailyNotePath = path.join(COMMANDS_DIR, "daily-note.md");
    const firstContent = await fs.readFile(dailyNotePath, "utf-8");

    consoleLogSpy.mockClear();

    // 第二次运行
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证文件内容未改变
    const secondContent = await fs.readFile(dailyNotePath, "utf-8");

    expect(secondContent).toBe(firstContent);

    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
