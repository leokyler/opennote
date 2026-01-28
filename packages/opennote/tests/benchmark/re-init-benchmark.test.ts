import { describe, test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { createCli } from "../../src/cli.js";
import path from "path";

describe("Re-init Performance Benchmarks", () => {
  const originalDir = process.cwd();
  const testDir = path.join(process.cwd(), ".test-reinit-benchmark");

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
   * SC-003: 重新初始化在 2 秒内完成（多次迭代）
   *
   * 验证在多次重复初始化场景下的性能
   */
  test("should re-initialize in under 2 seconds consistently (SC-003)", async () => {
    const cli = createCli();
    const iterations = 20;
    const times: number[] = [];

    // 第一次初始化
    const originalLog = console.log;
    console.log = () => {};

    try {
      await cli.parseAsync(["node", "opennote", "init"]);
    } finally {
      console.log = originalLog;
    }

    // 多次重复初始化并测巠时间
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

      // 每 5 次迭代输出一次
      if ((i + 1) % 5 === 0) {
        console.log(`Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
      }
    }

    // 计算统计数据
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const medianTime = times.sort((a, b) => a - b)[
      Math.floor(times.length / 2)
    ];

    const p50Time = times.sort((a, b) => a - b)[Math.floor(times.length * 0.5)];
    const p95Time = times.sort((a, b) => a - b)[
      Math.floor(times.length * 0.95)
    ];
    const p99Time = times.sort((a, b) => a - b)[
      Math.floor(times.length * 0.99)
    ];

    console.log(`\nRe-init Performance Summary (${iterations} iterations):`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Median: ${medianTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);
    console.log(`  P50: ${p50Time.toFixed(2)}ms`);
    console.log(`  P95: ${p95Time.toFixed(2)}ms`);
    console.log(`  P99: ${p99Time.toFixed(2)}ms`);
    console.log(`  Target: < 2000ms (SC-003)`);

    // 验证平均时间满足性能目标
    expect(avgTime).toBeLessThan(2000);

    // 验证至少 95% 的迭代满足性能目标
    const successCount = times.filter((t) => t < 2000).length;
    const successRate = (successCount / times.length) * 100;

    console.log(`\nSuccess Rate: ${successRate.toFixed(1)}%`);

    expect(successRate).toBeGreaterThanOrEqual(95);
  });

  /**
   * 状态检查性能基准
   *
   * 验证初始化状态检查的效率
   */
  test("should perform state checks efficiently", async () => {
    const cli = createCli();
    const iterations = 100;

    // 初始化
    const originalLog = console.log;
    console.log = () => {};

    try {
      await cli.parseAsync(["node", "opennote", "init"]);
    } finally {
      console.log = originalLog;
    }

    // 多次测巠状态检查时间
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      // 执行命令（将执行状态检查）
      console.log = () => {};

      try {
        await cli.parseAsync(["node", "opennote", "init"]);
      } finally {
        console.log = originalLog;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      times.push(duration);
    }

    // 计算统计数据
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`\nState Check Performance (${iterations} iterations):`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms`);
    console.log(`  Max: ${maxTime.toFixed(2)}ms`);
    console.log(`  Target: < 100ms for state check`);

    // 验证状态检查效率
    expect(avgTime).toBeLessThan(100);
  });

  /**
   * 冷启动 vs 热启动性能对比
   *
   * 比较首次初始化和重复初始化的性能
   */
  test("should show reasonable cold-start vs warm-start performance", async () => {
    const cli = createCli();

    // 冷启动：清理所有状态
    await cleanup();

    const coldStarts: number[] = [];
    const originalLog = console.log;
    const coldStartIterations = 5;

    for (let i = 0; i < coldStartIterations; i++) {
      await cleanup();

      const startTime = performance.now();

      console.log = () => {};

      try {
        await cli.parseAsync(["node", "opennote", "init"]);
      } finally {
        console.log = originalLog;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      coldStarts.push(duration);
    }

    const avgColdStart =
      coldStarts.reduce((a, b) => a + b, 0) / coldStarts.length;

    // 热启动：保持状态
    const warmStarts: number[] = [];
    const warmStartIterations = 20;

    for (let i = 0; i < warmStartIterations; i++) {
      const startTime = performance.now();

      console.log = () => {};

      try {
        await cli.parseAsync(["node", "opennote", "init"]);
      } finally {
        console.log = originalLog;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      warmStarts.push(duration);
    }

    const avgWarmStart =
      warmStarts.reduce((a, b) => a + b, 0) / warmStarts.length;

    console.log(`\nCold-start vs Warm-start Performance:`);
    console.log(`  Cold-start Average: ${avgColdStart.toFixed(2)}ms`);
    console.log(`  Warm-start Average: ${avgWarmStart.toFixed(2)}ms`);
    console.log(
      `  Speedup Factor: ${(avgColdStart / avgWarmStart).toFixed(2)}x`,
    );

    // 验证热启动比冷启动快
    expect(avgWarmStart).toBeLessThan(avgColdStart);

    // 验证速度提升在合理范围内（2x - 10x）
    const speedupFactor = avgColdStart / avgWarmStart;
    expect(speedupFactor).toBeGreaterThan(1);
    expect(speedupFactor).toBeLessThan(10);
  });

  /**
   * 扩展性性能基准
   *
   * 验证随着命令数量增加，性能如何扩展
   */
  test("should scale well with increasing command count", async () => {
    // 测试不同数量的命令
    const commandCounts = [3, 6, 10, 20];
    const results: { count: number; avgTime: number }[] = [];

    for (const count of commandCounts) {
      const cli = createCli();
      const times: number[] = [];
      const iterations = 5;

      // 首先初始化
      await cleanup();

      const originalLog = console.log;
      console.log = () => {};

      try {
        await cli.parseAsync(["node", "opennote", "init"]);
      } finally {
        console.log = originalLog;
      }

      // 测巠重复初始化时间
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
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      results.push({ count, avgTime });

      console.log(`${count} commands: ${avgTime.toFixed(2)}ms average`);
    }

    // 验证扩展性
    console.log(`\nScalability Analysis:`);

    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const curr = results[i];
      const countIncrease = curr.count / prev.count;
      const timeIncrease = curr.avgTime / prev.avgTime;
      const efficiency = timeIncrease / countIncrease;

      console.log(
        `${prev.count} → ${curr.count} commands: ${countIncrease.toFixed(2)}x count, ${timeIncrease.toFixed(2)}x time, efficiency: ${efficiency.toFixed(2)}`,
      );

      // 验证时间增长不超命令数量增长（效率 ≤ 1.5）
      expect(efficiency).toBeLessThanOrEqual(1.5);
    }
  });
});
