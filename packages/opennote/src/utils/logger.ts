import fs from "fs/promises";
import { existsSync } from "fs";

/**
 * 日志级别
 *
 * 定义日志消息的严重程度级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 日志级别名称映射
 */
const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
};

/**
 * 日志级别颜色映射（用于终端输出）
 */
const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "\x1b[36m", // Cyan
  [LogLevel.INFO]: "\x1b[32m", // Green
  [LogLevel.WARN]: "\x1b[33m", // Yellow
  [LogLevel.ERROR]: "\x1b[31m", // Red
};

/**
 * 重置终端颜色的代码
 */
const RESET_COLOR = "\x1b[0m";

/**
 * 日志配置
 *
 * 从环境变量读取配置，提供合理的默认值
 */
interface LoggerConfig {
  /**
   * 最小日志级别
   * 低于此级别的日志不会输出
   */
  minLevel: LogLevel;

  /**
   * 是否启用彩色输出
   * 检测是否在 TTY 终端中运行
   */
  useColors: boolean;

  /**
   * 日志文件路径
   * 从 LOG_FILE 环境变量读取
   * 如果未设置，则不写入文件
   */
  logFile?: string;

  /**
   * 是否包含时间戳
   */
  includeTimestamp: boolean;

  /**
   * 时间戳格式
   */
  timestampFormat: "iso" | "local" | "relative";
}

/**
 * 获取当前日志级别
 *
 * 从环境变量读取 LOG_LEVEL，默认为 INFO
 *
 * @returns 日志级别
 */
function getMinLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toUpperCase();

  switch (level) {
    case "DEBUG":
      return LogLevel.DEBUG;
    case "INFO":
      return LogLevel.INFO;
    case "WARN":
      return LogLevel.WARN;
    case "ERROR":
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO;
  }
}

/**
 * 日志文件写入器
 *
 * 缓冲日志写入以提高性能
 */
class LogFileWriter {
  private buffer: string[] = [];
  private writeScheduled = false;
  private maxBufferSize = 100;

  /**
   * 将消息写入缓冲区
   *
   * @param message - 要写入的日志消息
   */
  async write(message: string): Promise<void> {
    this.buffer.push(message);

    if (this.buffer.length >= this.maxBufferSize) {
      await this.flush();
    } else if (!this.writeScheduled) {
      this.writeScheduled = true;
      // 延迟写入，减少 I/O 操作
      new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
        this.flush().catch(() => {
          // 忽略错误
        });
      });
    }
  }

  /**
   * 将缓冲区内容写入文件
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const content = this.buffer.join("\n") + "\n";
    this.buffer = [];
    this.writeScheduled = false;

    try {
      await fs.appendFile(this.logFilePath, content, "utf-8");
    } catch (error) {
      // 文件写入失败不影响主流程
      console.error("Failed to write to log file:", error);
    }
  }

  /**
   * 获取日志文件路径
   */
  private get logFilePath(): string {
    return this.config.logFile!;
  }

  constructor(private config: LoggerConfig) {
    // 初始化日志文件
    if (this.config.logFile) {
      this.initializeLogFile().catch(() => {
        // 忽略初始化错误
      });
    }
  }

  /**
   * 初始化日志文件
   *
   * 确保日志文件存在且可写
   */
  private async initializeLogFile(): Promise<void> {
    if (!this.config.logFile) {
      return;
    }

    try {
      // 如果文件不存在，创建它
      if (!existsSync(this.config.logFile)) {
        const dir = this.config.logFile.substring(
          0,
          this.config.logFile.lastIndexOf("/"),
        );
        if (dir) {
          await fs.mkdir(dir, { recursive: true });
        }
        await fs.writeFile(this.config.logFile, "", "utf-8");
      }
    } catch (error) {
      // 忽略初始化错误
      console.error("Failed to initialize log file:", error);
    }
  }
}

/**
 * Logger 类
 *
 * 提供结构化的日志记录功能
 */
export class Logger {
  private config: LoggerConfig;
  private fileWriter?: LogFileWriter;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: config?.minLevel ?? getMinLevel(),
      useColors: config?.useColors ?? process.stdout.isTTY,
      logFile: config?.logFile ?? process.env.LOG_FILE,
      includeTimestamp: config?.includeTimestamp ?? true,
      timestampFormat: config?.timestampFormat ?? "iso",
    };

    if (this.config.logFile) {
      this.fileWriter = new LogFileWriter(this.config);
    }
  }

  /**
   * 格式化时间戳
   *
   * @param timestamp - Date 对象
   * @returns 格式化的时间字符串
   */
  private formatTimestamp(timestamp: Date): string {
    switch (this.config.timestampFormat) {
      case "iso":
        return timestamp.toISOString();
      case "local":
        return timestamp.toLocaleString();
      case "relative":
        return `${Date.now() - this.startTime}ms`;
      default:
        return timestamp.toISOString();
    }
  }

  /**
   * 启动时间（用于相对时间戳）
   */
  private startTime = Date.now();

  /**
   * 格式化日志消息
   *
   * @param level - 日志级别
   * @param message - 日志消息
   * @param meta - 额外元数据
   * @returns 格式化后的日志消息
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ): string {
    const levelName = LOG_LEVEL_NAMES[level];
    const timestamp = this.config.includeTimestamp
      ? this.formatTimestamp(new Date())
      : "";

    const parts: string[] = [];

    if (timestamp) {
      parts.push(`[${timestamp}]`);
    }

    parts.push(`[${levelName}]`);
    parts.push(message);

    if (meta && Object.keys(meta).length > 0) {
      parts.push(JSON.stringify(meta));
    }

    return parts.join(" ");
  }

  /**
   * 应用颜色（如果启用）
   *
   * @param level - 日志级别
   * @param message - 消息
   * @returns 带颜色的消息
   */
  private applyColor(level: LogLevel, message: string): string {
    if (!this.config.useColors) {
      return message;
    }

    const color = LOG_LEVEL_COLORS[level];
    return `${color}${message}${RESET_COLOR}`;
  }

  /**
   * 记录日志
   *
   * @param level - 日志级别
   * @param message - 日志消息
   * @param meta - 额外元数据
   */
  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    if (level < this.config.minLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);
    const coloredMessage = this.applyColor(level, formattedMessage);

    // 输出到控制台
    console.log(coloredMessage);

    // 写入文件
    if (this.fileWriter) {
      this.fileWriter.write(formattedMessage).catch(() => {
        // 忽略写入错误
      });
    }
  }

  /**
   * 记录 DEBUG 级别日志
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * 记录 INFO 级别日志
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * 记录 WARN 级别日志
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * 记录 ERROR 级别日志
   */
  error(message: string, error?: Error | Record<string, unknown>): void {
    const meta =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error;

    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * 刷新日志文件缓冲区
   */
  async flush(): Promise<void> {
    if (this.fileWriter) {
      await this.fileWriter.flush();
    }
  }
}

/**
 * 默认 Logger 实例
 */
export const logger = new Logger();

/**
 * 创建新的 Logger 实例
 *
 * @param config - 配置选项
 * @returns Logger 实例
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

/**
 * 设置默认日志级别
 *
 * @param level - 日志级别名称
 */
export function setLogLevel(level: "debug" | "info" | "warn" | "error"): void {
  process.env.LOG_LEVEL = level.toUpperCase();
}
