export interface PredefinedCommand {
  name: string;
  description: string;
  template: string;
  agent?: string;
  model?: string;
}

export interface CommandRegistration {
  name: string;
  installedAt: string;
  version: string;
  source: "predefined" | "user" | "project";
}

export interface InstallationState {
  initialized: boolean;
  version?: string;
  installedAt?: string;
  commands: CommandRegistration[];
}

export interface OpenCodeCommandFrontmatter {
  description: string;
  agent?: string;
  model?: string;
}
