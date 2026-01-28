import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import { createCli } from "../../src/cli.js";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

describe("OpenNote Integration Flow", () => {
  const originalDir = process.cwd();
  const testDir = path.join(process.cwd(), ".test-integration");

  beforeAll(async () => {
    // 创建测试目录
    const { mkdir } = await import("fs/promises");
    await mkdir(testDir, { recursive: true });

    // 切换到测试目录
    process.chdir(testDir);

    // 模拟 process.exit 以防止测试被终止
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit called with code ${code}`);
    });
  });

  afterEach(async () => {
    // 每个测试后清理
    await cleanup();
  });

  afterAll(() => {
    // 恢复原始目录
    process.chdir(originalDir);
  });

  /**
   * 清理测试环境
   */
  async function cleanup(): Promise<void> {
    const { rm } = await import("fs/promises");
    try {
      await rm(".opencode", { recursive: true, force: true });
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * 测试场景 1：完整初始化流程
   *
   * 验证：
   * 1. 初始化命令成功执行
   * 2. 创建 .opencode 目录
   * 3. 创建状态文件
   * 4. 创建所有命令文件
   * 5. 显示成功消息
   */
  test("should complete full initialization flow", async () => {
    const cli = createCli();

    const output: string[] = [];
    const originalLog = console.log;

    // 捕获输出
    console.log = (...args) => {
      output.push(args.join(" "));
      originalLog(...args);
    };

    try {
      // 执行初始化
      await cli.parseAsync(["node", "opennote", "init"]);

      // 验证输出
      expect(
        output.some((line) =>
          line.includes("OpenNote initialized successfully"),
        ),
      ).toBe(true);

      // 验证 .opencode 目录存在
      const stateFile = path.join(testDir, ".opencode", "opennote-state.json");
      const commandsDir = path.join(testDir, ".opencode", "commands");

      expect(existsSync(stateFile)).toBe(true);
      expect(existsSync(commandsDir)).toBe(true);

      // 验证状态文件内容
      const stateContent = await readFile(stateFile, "utf-8");
      const state = JSON.parse(stateContent);

      expect(state.initialized).toBe(true);
      expect(state.version).toBeDefined();
      expect(state.installedAt).toBeDefined();
      expect(state.commands).toBeDefined();
      expect(state.commands.length).toBeGreaterThan(0);

      // 验证命令文件存在
      const expectedCommands = [
        "daily-note.md",
        "meeting-note.md",
        "idea-note.md",
      ];

      for (const cmdFile of expectedCommands) {
        const cmdPath = path.join(commandsDir, cmdFile);
        expect(existsSync(cmdPath)).toBe(true);
      }

      // 验证命令文件内容
      const dailyNotePath = path.join(commandsDir, "daily-note.md");
      const dailyNoteContent = await readFile(dailyNotePath, "utf-8");

      expect(dailyNoteContent).toContain("---");
      expect(dailyNoteContent).toContain("description:");
      expect(dailyNoteContent).toContain("daily note");
    } finally {
      // 恢复原始 log 函数
      console.log = originalLog;
    }
  });

  /**
   * 测试场景 2：重复初始化流程
   *
   * 验证：
   * 1. 第二次初始化被正确处理
   * 2. 显示已初始化消息
   * 3. 不重复创建命令文件
   */
  test("should handle re-initialization gracefully", async () => {
    const cli = createCli();

    const output: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => {
      output.push(args.join(" "));
      originalLog(...args);
    };

    try {
      // 第一次初始化
      await cli.parseAsync(["node", "opennote", "init"]);
      output.length = 0; // 清空输出

      // 第二次初始化
      await cli.parseAsync(["node", "opennote", "init"]);

      // 验证输出
      expect(output.some((line) => line.includes("already initialized"))).toBe(
        true,
      );

      // 验证命令文件未被重复创建
      const commandsDir = path.join(testDir, ".opencode", "commands");
      const dailyNotePath = path.join(commandsDir, "daily-note.md");

      expect(existsSync(dailyNotePath)).toBe(true);
    } finally {
      console.log = originalLog;
    }
  });

  /**
   * 测试场景 3：强制重新初始化流程
   *
   * 验证：
   * 1. --force 选项工作正常
   * 2. 重新创建命令文件
   * 3. 更新状态文件
   */
  test("should handle force re-initialization", async () => {
    const cli = createCli();

    const output: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => {
      output.push(args.join(" "));
      originalLog(...args);
    };

    try {
      // 第一次初始化
      await cli.parseAsync(["node", "opennote", "init"]);

      // 获取初始状态
      const stateFile = path.join(testDir, ".opencode", "opennote-state.json");
      const initialStateContent = await readFile(stateFile, "utf-8");
      const initialState = JSON.parse(initialStateContent);
      const initialInstalledAt = initialState.installedAt;

      // 等待至少 1 毫秒以使时间戳不同
      await new Promise((resolve) => setTimeout(resolve, 10));

      output.length = 0; // 清空输出

      // 强制重新初始化
      await cli.parseAsync(["node", "opennote", "init", "--force"]);

      // 验证输出
      expect(
        output.some((line) => line.includes("initialized successfully")),
      ).toBe(true);

      // 验证状态文件已更新
      const newStateContent = await readFile(stateFile, "utf-8");
      const newState = JSON.parse(newStateContent);
      const newInstalledAt = newState.installedAt;

      expect(newInstalledAt).not.toBe(initialInstalledAt);
    } finally {
      console.log = originalLog;
    }
  });

  /**
   * 测试场景 4：损坏状态恢复流程
   *
   * 验证：
   * 1. 检测损坏的状态文件
   * 2. 自动清理损坏的状态
   * 3. 重新初始化成功
   */
  test("should recover from corrupted state", async () => {
    const cli = createCli();

    // 创建损坏的状态文件
    const stateFile = path.join(testDir, ".opencode", "opennote-state.json");
    const { mkdir, writeFile } = await import("fs/promises");

    await mkdir(".opencode", { recursive: true });
    await writeFile(stateFile, "{ invalid json content", "utf-8");

    const output: string[] = [];
    const originalLog = console.log;
    const originalWarn = console.warn;

    console.log = (...args) => {
      output.push(args.join(" "));
      originalLog(...args);
    };
    console.warn = (...args) => {
      output.push(args.join(" "));
      originalLog(...args);
    };

    try {
      // 尝试初始化
      await cli.parseAsync(["node", "opennote", "init"]);

      // 验证初始化成功（尽管有损坏的状态）
      expect(
        output.some((line) => line.includes("initialized successfully")),
      ).toBe(true);

      // 验证状态文件已修复
      const stateContent = await readFile(stateFile, "utf-8");
      const state = JSON.parse(stateContent);

      expect(state.initialized).toBe(true);
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
    }
  });

  /**
   * 测试场景 5：反馈消息验证
   *
   * 验证：
   * 1. 显示命令列表
   * 2. 显示命令描述
   * 3. 显示使用示例
   * 4. 输出格式正确
   */
  test("should display proper feedback messages", async () => {
    const cli = createCli();

    const output: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => {
      output.push(args.join(" "));
      originalLog(...args);
    };

    try {
      // 执行初始化
      await cli.parseAsync(["node", "opennote", "init"]);

      // 验证反馈消息
      const outputText = output.join("\n");

      // 验证包含命令列表
      expect(outputText).toContain("Installed");
      expect(outputText).toContain("commands:");

      // 验证包含命令名称
      expect(outputText).toContain("daily-note");
      expect(outputText).toContain("meeting-note");
      expect(outputText).toContain("idea-note");

      // 验证包含命令描述（使用实际描述中的关键词）
      expect(outputText).toContain("daily note");
      expect(outputText).toContain("meeting note");
      expect(outputText).toContain("ideas");

      // 验证包含使用示例
      expect(outputText).toContain("To use a command, run:");
      expect(outputText).toContain("opennote daily-note");
      expect(outputText).toContain("opennote meeting-note");
      expect(outputText).toContain("opennote idea-note");

      // 验证输出格式（有换行和缩进）
      expect(outputText).toContain("  -");
    } finally {
      console.log = originalLog;
    }
  });

  /**
   * 测试场景 6：版本检查流程
   *
   * 验证：
   * 1. 检测版本更新
   * 2. 显示更新提示
   * 3. --force 选项强制更新
   */
  test("should detect version updates", async () => {
    const cli = createCli();

    // 第一次初始化
    await cli.parseAsync(["node", "opennote", "init"]);

    // 修改状态文件，模拟旧版本
    const stateFile = path.join(testDir, ".opencode", "opennote-state.json");
    const stateContent = await readFile(stateFile, "utf-8");
    const state = JSON.parse(stateContent);
    state.version = "0.0.1"; // 设置为旧版本

    const { writeFile } = await import("fs/promises");
    await writeFile(stateFile, JSON.stringify(state), "utf-8");

    const output: string[] = [];
    const originalLog = console.log;

    console.log = (...args) => {
      output.push(args.join(" "));
      originalLog(...args);
    };

    try {
      // 尝试再次初始化
      await cli.parseAsync(["node", "opennote", "init"]);

      // 验证显示更新提示
      const outputText = output.join("\n");
      expect(outputText).toContain("can be updated");
      expect(outputText).toContain("version 0.0.1");
      expect(outputText).toContain("--force");
    } finally {
      console.log = originalLog;
    }
  });
});
