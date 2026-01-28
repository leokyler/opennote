import { Command } from "commander";
import { createInitCommand } from "./commands/init.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// 读取 package.json 获取版本号
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8")
);

export function createCli(): Command {
  const program = new Command("opennote")
    .description("OpenCode commands for note-taking workflows")
    .version(packageJson.version);  // 从 package.json 读取版本号
  
  // 将版本号传递给 init 命令
  program.addCommand(createInitCommand(packageJson.version));  
  
  return program;
}
