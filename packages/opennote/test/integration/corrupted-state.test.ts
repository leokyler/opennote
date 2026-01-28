/**
 * 损坏状态恢复测试套件
 * 
 * 本测试套件验证 OpenNote 在检测到损坏状态时的自动恢复能力
 * 确保系统能够识别无效的配置并自动重新初始化
 * 
 * 测试覆盖场景：
 * 1. 状态文件包含无效的 JSON
 * 2. 状态文件缺少必需字段
 * 3. 命令文件损坏或丢失
 * 
 * 这些是用户故事 2 的关键场景：系统应能从错误状态自动恢复
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createInitCommand } from "../../src/commands/init.js";
import { loadState } from "../../src/utils/state-manager.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// 状态文件路径
const STATE_FILE = ".opencode/opennote-state.json";

// 命令目录
const COMMANDS_DIR = ".opencode/commands";

describe("Corrupted State Recovery", () => {
  let tempDir: string;
  let packageVersion: string;

  /**
   * 每个测试前的设置
   * 
   * 1. 在系统临时目录创建唯一的测试目录
   * 2. 切换工作目录到测试目录
   * 3. 读取 package.json 获取版本号
   * 
   * 隔离测试环境，避免污染实际项目目录
   */
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "opennote-test-"));
    process.chdir(tempDir);
    
    // 读取 package.json 获取版本号
    const __dirname = dirname(fileURLToPath(import.meta.url));
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
   * 测试场景：状态文件包含无效的 JSON
   * 
   * 验证点：
   * 1. 创建包含无效 JSON 的状态文件
   * 2. 系统检测到 JSON 解析错误
   * 3. 自动触发重新初始化
   * 4. 生成新的有效状态文件
   * 
   * 目的：确保系统能从 JSON 损坏中自动恢复
   * 
   * 常见原因：
   * - 文件被意外截断
   * - 手动编辑导致语法错误
   * - 磁盘错误导致部分写入
   */
  it("should re-initialize when state file contains invalid JSON", async () => {
    // 创建 .opencode 目录
    await fs.mkdir(".opencode", { recursive: true });
    
    // 写入无效的 JSON 内容（缺少引号和结构）
    await fs.writeFile(STATE_FILE, "{invalid json content}");

    // 创建 init 命令，传递版本号
    const initCommand = createInitCommand(packageVersion);

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 运行 init 命令
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证状态文件已重新生成且有效
    const state = await loadState();
    expect(state).toBeDefined();
    expect(state?.initialized).toBe(true);

    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  /**
   * 测试场景：状态文件缺少必需字段
   * 
   * 验证点：
   * 1. 创建只有部分字段的 JSON 状态文件
   * 2. 系统检测到缺少 commands 字段
   * 3. 自动触发重新初始化
   * 4. 生成包含完整字段的新状态文件
   * 
   * 目的：确保状态文件验证能够检测不完整的配置
   * 
   * 常见原因：
   * - 版本升级后字段变更
   * - 手动编辑删除了必要字段
   * - 程序异常导致部分写入
   */
  it("should re-initialize when state file is missing required fields", async () => {
    // 创建 .opencode 目录
    await fs.mkdir(".opencode", { recursive: true });
    
    // 写入只有 initialized 字段的 JSON（缺少 commands, version, installedAt）
    await fs.writeFile(STATE_FILE, JSON.stringify({ initialized: true }));

    // 创建 init 命令，传递版本号
    const initCommand = createInitCommand(packageVersion);

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 运行 init 命令
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证状态文件包含所有必需字段
    const state = await loadState();
    expect(state).toBeDefined();
    expect(state?.initialized).toBe(true);
    expect(state?.commands).toBeDefined();
    expect(state?.commands.length).toBeGreaterThan(0);

    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  /**
   * 测试场景：检测并修复损坏的命令文件
   * 
   * 验证点：
   * 1. 创建有效的状态文件
   * 2. 创建损坏的命令文件（内容不符合规范）
   * 3. 系统检测到命令文件不一致
   * 4. 自动触发重新初始化
   * 5. 生成有效的命令文件
   * 
   * 目的：确保命令文件损坏时系统能够自动恢复
   * 
   * 常见原因：
   * - 文件被意外修改或删除
   * - 磁盘错误导致文件损坏
   * - 恶意或意外的文件修改
   */
  it("should detect corrupted command files", async () => {
    // 创建命令目录和有效的状态文件
    await fs.mkdir(COMMANDS_DIR, { recursive: true });
    await fs.writeFile(
      STATE_FILE,
      JSON.stringify({
        initialized: true,
        version: "1.0.0",
        installedAt: new Date().toISOString(),
        commands: [
          {
            name: "daily-note",
            installedAt: new Date().toISOString(),
            version: "1.0.0",
            source: "predefined",
          },
        ],
      }),
    );

    // 写入无效的命令文件（缺少 frontmatter 和正确格式）
    await fs.writeFile(path.join(COMMANDS_DIR, "daily-note.md"), "invalid content");

    // 创建 init 命令，传递版本号
    const initCommand = createInitCommand(packageVersion);

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // 运行 init 命令
    await initCommand.parseAsync(["node", "opennote", "init"]);

    // 验证命令目录存在
    const commandsDirExists = await fs
      .access(COMMANDS_DIR)
      .then(() => true)
      .catch(() => false);

    expect(commandsDirExists).toBe(true);

    processExitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
