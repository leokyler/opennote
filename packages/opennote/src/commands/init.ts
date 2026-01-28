import { Command } from "commander";
import { isInitialized, loadState, saveState } from "../utils/state-manager.js";
import { installCommands } from "../utils/command-installer.js";
import { PREDEFINED_COMMANDS } from "./index.js";

export function createInitCommand(): Command {
  const initCommand = new Command("init")
    .description("Initialize OpenNote with predefined note commands")
    .action(async () => {
      console.log("Initializing OpenNote...");

      try {
        if (await isInitialized()) {
          const state = await loadState();
          console.log(
            `OpenNote is already initialized (version ${state?.version}).`,
          );
          console.log("No action taken. Commands remain available.");
          return;
        }

        await installCommands(PREDEFINED_COMMANDS);

        const newState = {
          initialized: true,
          version: "1.0.0",
          installedAt: new Date().toISOString(),
          commands: PREDEFINED_COMMANDS.map((cmd) => ({
            name: cmd.name,
            installedAt: new Date().toISOString(),
            version: "1.0.0",
            source: "predefined" as const,
          })),
        };

        await saveState(newState);

        console.log("✓ OpenNote initialized successfully!");
        console.log(`✓ Installed ${PREDEFINED_COMMANDS.length} commands:`);
        PREDEFINED_COMMANDS.forEach((cmd) => {
          console.log(`  - ${cmd.name}: ${cmd.description}`);
        });
        console.log("");
        console.log("To use a command, run: opennote <command-name>");
        console.log("Example: opennote daily-note");
      } catch (error) {
        console.error("✗ Initialization failed:", error);
        process.exit(1);
      }
    });

  return initCommand;
}
