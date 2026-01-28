import { describe, test, expect, vi } from "vitest";
import {
  loadState,
  saveState,
  isInitialized,
} from "../../src/utils/state-manager.js";
import { fileExists } from "../../src/utils/file-operations.js";
import { InstallationState } from "../../src/types/index.js";
import fs from "fs/promises";

vi.mock("../../src/utils/file-operations");
vi.mock("fs/promises", async () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    access: vi.fn(),
  },
}));
vi.mock("path", async () => ({
  default: {
    dirname: vi.fn((path: string) => path.split("/").slice(0, -1).join("/")),
  },
}));

describe("state manager", () => {
  test("should return null when state file does not exist", async () => {
    const mockFileExists = vi.mocked(fileExists);
    mockFileExists.mockResolvedValue(false);

    const state = await loadState();

    expect(state).toBeNull();
  });

  test("should return state when state file exists", async () => {
    const mockFileExists = vi.mocked(fileExists);
    const mockReadFile = vi.mocked(fs.readFile);

    const expectedState = {
      initialized: true,
      version: "1.0.0",
      installedAt: "2026-01-27T00:00:00Z",
      commands: [
        {
          name: "daily-note",
          installedAt: "2026-01-27T00:00:00Z",
          version: "1.0.0",
          source: "predefined",
        },
      ],
    };

    mockFileExists.mockResolvedValue(true);
    mockReadFile.mockResolvedValue(JSON.stringify(expectedState));

    const state = await loadState();

    expect(state).toEqual(expectedState);
  });

  test("should return true when initialized", async () => {
    const mockFileExists = vi.mocked(fileExists);
    const mockReadFile = vi.mocked(fs.readFile);

    const state = {
      initialized: true,
      version: "1.0.0",
      installedAt: "2026-01-27T00:00:00Z",
      commands: [],
    };

    mockFileExists.mockResolvedValue(true);
    mockReadFile.mockResolvedValue(JSON.stringify(state));

    const initialized = await isInitialized();

    expect(initialized).toBe(true);
  });

  test("should return false when not initialized", async () => {
    const mockFileExists = vi.mocked(fileExists);
    mockFileExists.mockResolvedValue(false);

    const initialized = await isInitialized();

    expect(initialized).toBe(false);
  });

  test("should save state successfully", async () => {
    const mockMkdir = vi.mocked(fs.mkdir);
    const mockWriteFile = vi.mocked(fs.writeFile);

    const state: InstallationState = {
      initialized: true,
      version: "1.0.0",
      installedAt: "2026-01-27T00:00:00Z",
      commands: [
        {
          name: "daily-note",
          installedAt: "2026-01-27T00:00:00Z",
          version: "1.0.0",
          source: "predefined",
        },
      ],
    };

    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    await saveState(state);

    expect(mockMkdir).toHaveBeenCalledWith(".opencode", { recursive: true });
    expect(mockWriteFile).toHaveBeenCalledWith(
      ".opencode/opennote-state.json",
      JSON.stringify(state, null, 2),
      "utf-8",
    );
  });

  test("should throw error when save fails", async () => {
    const mockMkdir = vi.mocked(fs.mkdir);
    const mockWriteFile = vi.mocked(fs.writeFile);

    const state: InstallationState = {
      initialized: true,
      version: "1.0.0",
      installedAt: "2026-01-27T00:00:00Z",
      commands: [],
    };

    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockRejectedValue(new Error("Write failed"));
    console.log("should throw error in next line:");
    await expect(saveState(state)).rejects.toThrow("Write failed");
  });
});
