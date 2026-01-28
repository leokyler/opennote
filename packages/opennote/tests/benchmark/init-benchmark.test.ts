import { describe, test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { createCli } from "../../src/cli.js";
import path from "path";

describe("Performance Benchmarks", () => {
  const originalDir = process.cwd();
  const testDir = path.join(process.cwd(), ".test-benchmark");

  beforeAll(async () => {
    const { mkdir } = await import("fs/promises");
    await mkdir(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(async () => {
    await cleanup();
  });

  afterAll(() => {
    process.chdir(originalDir);
  });

  async function cleanup(): Promise<void> {
    const { rm } = await import("fs/promises");
    try {
      await rm(".opencode", { recursive: true, force: true });
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * SC-001: 初始化在 5 秒内完成
   *
   * 基准环境：
   * - GitHub Actions ubuntu-latest runner (2 vCPU, 8 GB RAM)
   * - Node.js 18 LTS
   * - 使用 performance.now() 测量
   * - 冷启动场景
   *
   * 目标：< 5000ms
   */
  test("should initialize in under 5 seconds (SC-001)", async () => {
    const cli = createCli();
    const iterations = 5;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      await cleanup();

      const startTime = performance.now();

      // 禁用 console.log 以避免影响性能
      const originalLog = console.log;
      console.log = () => {};

      try {
        await cli.parseAsync(["node", "opennote", "init"]);
      } finally {
        console.log = originalLog;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      times.push(duration);

      console.log(`Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
    }

    // 计算统计数据
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`\nPerformance Summary:`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);
    console.log(`  Target: < 5000ms (SC-001)`);

    // 验证平均值满足性能目标
    expect(avgTime).toBeLessThan(5000);

    // 验证所有迭代都满足性能目标
    expect(times.every((t) => t < 5000)).toBe(true);
  });

  /**
   * SC-003: 重新初始化在 2 秒内完成
   *
   * 基准环境：
   * - GitHub Actions ubuntu-latest runner (2 vCPU, 8 GB RAM)
   * - Node.js 18 LTS
   * - 使用 performance.now() 测量
   * - 已初始化状态
   *
   * 目标：< 2000ms
   */
  test("should re-initialize in under 2 seconds (SC-003)", async () => {
    const cli = createCli();
    const iterations = 10;
    const times: number[] = [];

    // 第一次初始化
    const originalLog = console.log;
    console.log = () => {};

    try {
      await cli.parseAsync(["node", "opennote", "init"]);
    } finally {
      console.log = originalLog;
    }

    // 测量重新初始化时间
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      console.log = () => {};

      try {
        await cli.parseAsync(["node", "opennote", "init"]);
      } finally {
        console.log = originalLog;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      times.push(duration);

      console.log(`Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
    }

    // 计算统计数据
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`\nPerformance Summary:`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);
    console.log(`  Target: < 2000ms (SC-003)`);

    // 验证平均值满足性能目标
    expect(avgTime).toBeLessThan(2000);

    // 验证所有迭代都满足性能目标
    expect(times.every((t) => t < 2000)).toBe(true);
  });

  /**
   * 命令创建性能基准
   *
   * 验证单个命令文件的创建时间
   * 目标：每个命令 < 10ms
   */
  test("should create individual command files efficiently", async () => {
    const { writeFile } = await import("fs/promises");
    const { mkdir } = await import("fs/promises");

    await mkdir(".opencode", { recursive: true });
    await mkdir(".opencode/commands", { recursive: true });

    const commandTemplate = `---
description: Test command
agent: general
---

Test template content
`;

    const iterations = 100;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      await writeFile(
        `.opencode/commands/command-${i}.md`,
        commandTemplate,
        "utf-8",
      );

      const endTime = performance.now();
      const duration = endTime - startTime;
      times.push(duration);
    }

    // 计算统计数据
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`\nFile Creation Performance:`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);
    console.log(`  Target: < 10ms per file`);

    // 验证平均文件创建时间
    expect(avgTime).toBeLessThan(10);
  });

  /**
   * 状态文件读写性能基准
   *
   * 验证状态文件的读取和写入性能
   */
  test("should handle state file I/O efficiently", async () => {
    const { readFile, writeFile, mkdir } = await import("fs/promises");

    await mkdir(".opencode", { recursive: true });

    const state = {
      initialized: true,
      version: "1.0.0",
      installedAt: new Date().toISOString(),
      commands: Array.from({ length: 10 }, (_, i) => ({
        name: `command-${i}`,
        installedAt: new Date().toISOString(),
        version: "1.0.0",
        source: "predefined" as const,
      })),
    };

    const stateFilePath = ".opencode/opennote-state.json";
    const iterations = 100;

    // 测量写入性能
    const writeTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      await writeFile(stateFilePath, JSON.stringify(state), "utf-8");

      const endTime = performance.now();
      writeTimes.push(endTime - startTime);
    }

    // 测量读取性能
    const readTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      await readFile(stateFilePath, "utf-8");

      const endTime = performance.now();
      readTimes.push(endTime - startTime);
    }

    // 计算统计数据
    const avgWriteTime =
      writeTimes.reduce((a, b) => a + b, 0) / writeTimes.length;
    const avgReadTime = readTimes.reduce((a, b) => a + b, 0) / readTimes.length;

    console.log(`\nState File I/O Performance:`);
    console.log(`  Write Average: ${avgWriteTime.toFixed(2)}ms`);
    console.log(`  Read Average: ${avgReadTime.toFixed(2)}ms`);

    // 验证 I/O 性能在合理范围内
    expect(avgWriteTime).toBeLessThan(50); // 写入应该很快
    expect(avgReadTime).toBeLessThan(10); // 读取应该很快
  });

  /**
   * 内存使用基准
   *
   * 验证初始化过程中的内存使用
   */
  test("should have reasonable memory usage", async () => {
    const cli = createCli();

    await cleanup();

    const initialMemory = process.memoryUsage();
    const originalLog = console.log;
    console.log = () => {};

    try {
      await cli.parseAsync(["node", "opennote", "init"]);
    } finally {
      console.log = originalLog;
    }

    const finalMemory = process.memoryUsage();

    const memoryDelta = {
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
      external: finalMemory.external - initialMemory.external,
    };

    console.log(`\nMemory Usage:`);
    console.log(
      `  Heap Used Delta: ${(memoryDelta.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log(
      `  Heap Total Delta: ${(memoryDelta.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log(
      `  External Delta: ${(memoryDelta.external / 1024 / 1024).toFixed(2)} MB`,
    );

    // 验证内存增长在合理范围内（< 50MB）
    expect(memoryDelta.heapUsed).toBeLessThan(50 * 1024 * 1024);
  });
});
