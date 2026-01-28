import { PredefinedCommand } from "../types/index.js";

const NAME_REGEX = /^[a-z0-9-]+$/;
const AGENT_VALUES = ["general", "plan", "build", "explore"];

export function validateCommand(command: PredefinedCommand): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!command.name || !NAME_REGEX.test(command.name)) {
    errors.push("Name must be alphanumeric with hyphens only");
  }

  if (!command.description || command.description.trim().length === 0) {
    errors.push("Description is required and cannot be empty");
  }

  if (command.description && command.description.length >= 200) {
    errors.push("Description must be less than 200 characters");
  }

  if (!command.template || command.template.trim().length === 0) {
    errors.push("Template is required and cannot be empty");
  }

  if (command.agent && !AGENT_VALUES.includes(command.agent)) {
    errors.push(`Agent must be one of: ${AGENT_VALUES.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function registerCommand(command: PredefinedCommand): void {
  const validation = validateCommand(command);

  if (!validation.valid) {
    throw new Error(`Invalid command: ${validation.errors.join(", ")}`);
  }

  console.log(`Registering command: ${command.name}`);
}
