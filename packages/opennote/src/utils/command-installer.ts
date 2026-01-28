import path from "path";
import { mkdir, writeFile } from "./file-operations.js";
import { PredefinedCommand } from "../types/index.js";
import { validateCommand } from "./command-registry.js";

const COMMANDS_DIR = ".opencode/commands";

export async function createCommandDirectory(): Promise<void> {
  await mkdir(COMMANDS_DIR);
}

export async function createCommandFile(
  command: PredefinedCommand,
): Promise<void> {
  const validation = validateCommand(command);

  if (!validation.valid) {
    throw new Error(
      `Invalid command definition for ${command.name}: ${validation.errors.join(", ")}`,
    );
  }

  const frontmatter = `---
description: ${command.description}
${command.agent ? `agent: ${command.agent}` : ""}
${command.model ? `model: ${command.model}` : ""}
---
`;

  const content = `${frontmatter}${command.template}`;
  const filePath = path.join(COMMANDS_DIR, `${command.name}.md`);

  await writeFile(filePath, content);
  console.log(`Created command file: ${filePath}`);
}

export async function copyTemplate(
  sourcePath: string,
  destPath: string,
): Promise<void> {
  const fs = await import("fs/promises");

  const content = await fs.readFile(sourcePath, "utf-8");
  await writeFile(destPath, content);
  console.log(`Copied template from ${sourcePath} to ${destPath}`);
}

export async function installCommands(
  commands: PredefinedCommand[],
): Promise<void> {
  console.log(`Installing ${commands.length} commands...`);

  await createCommandDirectory();

  for (const command of commands) {
    await createCommandFile(command);
  }

  console.log("All commands installed successfully!");
}
