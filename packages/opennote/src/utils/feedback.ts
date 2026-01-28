import type { PredefinedCommand } from "../types/index.js";

/**
 * 格式化命令列表
 *
 * 将预定义命令列表格式化为易读的字符串，包含命令名称和描述
 *
 * @param commands - 预定义命令数组
 * @returns 格式化后的命令列表字符串
 */
export function formatCommandList(commands: PredefinedCommand[]): string {
  if (commands.length === 0) {
    return "No commands installed.";
  }

  return commands
    .map((cmd) => `  - ${cmd.name}: ${cmd.description}`)
    .join("\n");
}

/**
 * 生成成功消息
 *
 * 生成初始化成功的消息，包含已安装命令的数量
 *
 * @param count - 已安装命令的数量
 * @returns 格式化的成功消息
 */
export function generateSuccessMessage(count: number): string {
  const commandWord = count === 1 ? "command" : "commands";
  return `✓ Installed ${count} ${commandWord}:`;
}

/**
 * 生成使用示例
 *
 * 为每个命令生成使用示例，展示如何调用
 *
 * @param commands - 预定义命令数组
 * @returns 格式化的使用示例字符串
 */
export function generateUsageExamples(commands: PredefinedCommand[]): string {
  if (commands.length === 0) {
    return "No usage examples available.";
  }

  const examples = commands.map((cmd) => `  - opennote ${cmd.name}`).join("\n");

  return `To use a command, run:\n${examples}`;
}

/**
 * 生成完整的初始化成功输出
 *
 * 组合所有反馈消息，生成完整的初始化成功输出
 *
 * @param commands - 预定义命令数组
 * @returns 完整的格式化输出
 */
export function generateInitSuccessOutput(
  commands: PredefinedCommand[],
): string {
  const successMessage = generateSuccessMessage(commands.length);
  const commandList = formatCommandList(commands);
  const usageExamples = generateUsageExamples(commands);

  return [
    "✓ OpenNote initialized successfully!",
    "",
    successMessage,
    commandList,
    "",
    usageExamples,
  ].join("\n");
}
