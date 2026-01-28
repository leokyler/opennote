import fs from "fs/promises";
import path from "path";
import { InstallationState } from "../types/index.js";
import { fileExists } from "./file-operations.js";

const STATE_FILE = ".opencode/opennote-state.json";

export async function loadState(): Promise<InstallationState | null> {
  try {
    if (!(await fileExists(STATE_FILE))) {
      return null;
    }

    const content = await fs.readFile(STATE_FILE, "utf-8");
    return JSON.parse(content) as InstallationState;
  } catch (error) {
    console.warn("Failed to load state:", error);
    return null;
  }
}

export async function saveState(state: InstallationState): Promise<void> {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save state:", error);
    throw error;
  }
}

export async function isInitialized(): Promise<boolean> {
  const state = await loadState();
  return state !== null && state.initialized;
}
