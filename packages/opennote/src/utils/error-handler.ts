/**
 * 自定义错误类
 *
 * 定义 OpenNote 初始化过程中可能出现的错误类型
 */

/**
 * 安装错误
 *
 * 当命令安装过程中发生错误时抛出
 *
 * 错误类型：
 * - 命令文件创建失败
 * - 状态文件写入失败
 * - 目录创建失败
 *
 * 用途：
 * - 提供详细的安装失败信息
 * - 区分安装错误与其他类型错误
 * - 支持错误消息的本地化和格式化
 */
export class InstallationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "InstallationError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误
 *
 * 当输入验证失败时抛出
 *
 * 验证类型：
 * - 命令名称格式无效
 * - 必填字段缺失
 * - 字段值超出范围
 * - 数据类型不匹配
 *
 * 用途：
 * - 在数据处理前验证输入
 * - 提供清晰的验证失败原因
 * - 支持快速失败（fail-fast）策略
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
  ) {
    super(message);
    this.name = "ValidationError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 权限错误
 *
 * 当文件系统权限不足时抛出
 *
 * 权限问题类型：
 * - 无法读取文件
 * - 无法写入文件
 * - 无法创建目录
 * - 无法删除文件或目录
 *
 * 用途：
 * - 明确标识权限相关错误
 * - 提供文件/目录路径信息
 * - 建议权限修复方法
 */
export class PermissionError extends Error {
  constructor(
    message: string,
    public readonly path?: string,
    public readonly operation?: "read" | "write" | "create" | "delete",
  ) {
    super(message);
    this.name = "PermissionError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 状态错误
 *
 * 当系统状态异常时抛出
 *
 * 状态异常类型：
 * - 状态文件损坏
 * - 状态版本不兼容
 * - 状态数据不一致
 *
 * 用途：
 * - 标识状态管理问题
 * - 支持自动恢复机制
 * - 提供状态重建选项
 */
export class StateError extends Error {
  constructor(
    message: string,
    public readonly currentState?: unknown,
    public readonly expectedState?: unknown,
  ) {
    super(message);
    this.name = "StateError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 创建权限错误
 *
 * 根据错误代码和路径创建标准化的权限错误
 *
 * @param code - 错误代码（如 EACCES）
 * @param path - 文件或目录路径
 * @param operation - 操作类型
 * @returns PermissionError 实例
 */
export function createPermissionError(
  code: string,
  path: string,
  operation: "read" | "write" | "create" | "delete",
): PermissionError {
  const operationText = {
    read: "read",
    write: "write to",
    create: "create",
    delete: "delete",
  }[operation];

  return new PermissionError(
    `Permission denied: cannot ${operationText} ${path}`,
    path,
    operation,
  );
}

/**
 * 创建安装错误
 *
 * 根据原因和上下文创建详细的安装错误
 *
 * @param message - 错误消息
 * @param cause - 底层错误原因
 * @param context - 额外上下文信息
 * @returns InstallationError 实例
 */
export function createInstallationError(
  message: string,
  cause?: Error,
  context?: Record<string, unknown>,
): InstallationError {
  return new InstallationError(message, cause, context);
}

/**
 * 创建验证错误
 *
 * 根据字段和值创建验证错误
 *
 * @param message - 错误消息
 * @param field - 验证失败的字段名
 * @param value - 无效的值
 * @returns ValidationError 实例
 */
export function createValidationError(
  message: string,
  field?: string,
  value?: unknown,
): ValidationError {
  return new ValidationError(message, field, value);
}

/**
 * 格式化错误消息
 *
 * 将错误转换为用户友好的消息格式
 *
 * @param error - 错误对象
 * @returns 格式化后的错误消息
 */
export function formatErrorMessage(error: Error): string {
  if (error instanceof PermissionError) {
    return [
      "✗ Permission denied",
      `  Path: ${error.path}`,
      `  Operation: ${error.operation}`,
      "  Suggestion: Check file/directory permissions",
    ].join("\n");
  }

  if (error instanceof ValidationError) {
    return [
      "✗ Validation failed",
      error.field ? `  Field: ${error.field}` : "",
      error.value ? `  Value: ${JSON.stringify(error.value)}` : "",
      `  Reason: ${error.message}`,
    ].join("\n");
  }

  if (error instanceof InstallationError) {
    return [
      "✗ Installation failed",
      `  Reason: ${error.message}`,
      error.cause ? `  Cause: ${error.cause.message}` : "",
      error.context ? `  Context: ${JSON.stringify(error.context)}` : "",
    ].join("\n");
  }

  if (error instanceof StateError) {
    return [
      "✗ State error",
      `  Reason: ${error.message}`,
      "  Suggestion: Try running with --force to reinitialize",
    ].join("\n");
  }

  return `✗ Error: ${error.message}`;
}

/**
 * 获取错误类型名称
 *
 * @param error - 错误对象
 * @returns 错误类型名称
 */
export function getErrorTypeName(error: Error): string {
  return error.constructor.name;
}

/**
 * 判断是否为可恢复错误
 *
 * 检查错误是否可以通过重试或其他操作恢复
 *
 * @param error - 错误对象
 * @returns 是否为可恢复错误
 */
export function isRecoverableError(error: Error): boolean {
  if (error instanceof PermissionError) {
    return false;
  }

  if (error instanceof ValidationError) {
    return false;
  }

  if (error instanceof StateError) {
    return true;
  }

  // 对于未知错误，假设为可恢复
  return true;
}
