import { describe, test, expect, vi } from "vitest";
import {
  mkdir,
  writeFile,
  readFile,
  fileExists,
} from "../../src/utils/file-operations";
import { promises as fs } from "fs";

vi.mock("fs", async () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

describe("file operations", () => {
  test("should create directory recursively", async () => {
    const mockMkdir = vi.mocked(fs.mkdir);

    await mkdir("/test/path");

    expect(mockMkdir).toHaveBeenCalledWith("/test/path", { recursive: true });
  });

  test("should write file with content", async () => {
    const mockMkdir = vi.mocked(fs.mkdir);
    const mockWriteFile = vi.mocked(fs.writeFile);

    await writeFile("/test/path/file.txt", "test content");

    expect(mockMkdir).toHaveBeenCalledWith("/test/path", { recursive: true });
    expect(mockWriteFile).toHaveBeenCalledWith(
      "/test/path/file.txt",
      "test content",
      "utf-8",
    );
  });

  test("should read file content", async () => {
    const mockReadFile = vi.mocked(fs.readFile);

    mockReadFile.mockResolvedValue("test content");

    const content = await readFile("/test/path/file.txt");

    expect(mockReadFile).toHaveBeenCalledWith("/test/path/file.txt", "utf-8");
    expect(content).toBe("test content");
  });

  test("should return true when file exists", async () => {
    const mockAccess = vi.fn();
    vi.doMock("fs", async () => ({
      promises: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        access: mockAccess,
      },
      constants: { F_OK: 0 },
    }));

    mockAccess.mockResolvedValue(undefined);

    const exists = await fileExists("/test/path/file.txt");

    expect(exists).toBe(true);
  });

  test("should return false when file does not exist", async () => {
    const mockAccess = vi.fn();
    vi.doMock("fs", async () => ({
      promises: {
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        access: mockAccess,
      },
      constants: { F_OK: 0 },
    }));

    mockAccess.mockRejectedValue(new Error("File not found"));

    const exists = await fileExists("/test/path/nonexistent.txt");

    expect(exists).toBe(false);
  });
});
