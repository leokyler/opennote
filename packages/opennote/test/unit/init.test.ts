import { describe, test, expect, vi } from "vitest";
import { createCli } from "../../src/index";
import { validateCommand } from "../../src/utils/command-registry";
import { isInitialized, loadState, isStateValid } from "../../src/utils/state-manager";
import { mkdir, writeFile, fileExists } from "../../src/utils/file-operations";

vi.mock("../../src/cli");
vi.mock("../../src/utils/command-registry");
vi.mock("../../src/utils/state-manager");
vi.mock("../../src/utils/file-operations");

describe("init command", () => {
  test("should create commands directory and write command files", async () => {
    const mockMkdir = vi.mocked(mkdir);
    const mockWriteFile = vi.mocked(writeFile);
    const mockValidateCommand = vi.mocked(validateCommand);
    const mockIsInitialized = vi.mocked(isInitialized);

    mockIsInitialized.mockResolvedValue(false);
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
    mockValidateCommand.mockReturnValue({ valid: true, errors: [] });

    const cli = createCli();
    await cli.parseAsync(["node", "opennote", "init"]);

    expect(mockMkdir).toHaveBeenCalledWith(".opencode/commands");
    expect(mockWriteFile).toHaveBeenCalledTimes(6);
  });

  test("should skip installation if already initialized", async () => {
    const mockIsInitialized = vi.mocked(isInitialized);
    const mockLoadState = vi.mocked(loadState);
    const mockIsStateValid = vi.mocked(isStateValid);
    const consoleSpy = vi.spyOn(console, "log");

    mockIsInitialized.mockResolvedValue(true);
    mockIsStateValid.mockResolvedValue(true);
    mockLoadState.mockResolvedValue({
      initialized: true,
      version: "1.0.0",
      commands: [
        {
          name: "daily-note",
          installedAt: new Date().toISOString(),
          version: "1.0.0",
          source: "predefined" as const,
        },
      ],
    });

    const cli = createCli();
    await cli.parseAsync(["node", "opennote", "init"]);

    expect(consoleSpy).toHaveBeenCalledWith(
      "OpenNote is already initialized (version 1.0.0).",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "No action taken. Commands remain available.",
    );
  });
});
