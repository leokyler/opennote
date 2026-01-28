import { Command } from "commander";
import { createInitCommand } from "./commands/init.js";

export function createCli(): Command {
  const program = new Command("opennote")
    .description("OpenCode commands for note-taking workflows")
    .version("1.0.0");

  program.addCommand(createInitCommand());

  return program;
}
