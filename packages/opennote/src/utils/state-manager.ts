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

export async function isStateValid(): Promise<boolean> {
  const state = await loadState();
  if (!state) return false;

  return (
    state.initialized === true &&
    state.commands !== undefined &&
    state.commands.length > 0
  );
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

export function needsUpdate(
  currentVersion: string | undefined,
  newVersion: string,
): boolean {
  if (!currentVersion) return true;
  return compareVersions(newVersion, currentVersion) > 0;
}
