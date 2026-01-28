import { describe, test, expect } from "vitest";
import { validateCommand } from "../../src/utils/command-registry";

describe("command registry", () => {
  test("should validate correct command", () => {
    const command = {
      name: "test-command",
      description: "Test command description",
      template: "Test template content",
      agent: "general",
    };

    const result = validateCommand(command);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("should reject command with invalid name", () => {
    const command = {
      name: "Invalid Name!",
      description: "Test description",
      template: "Test template",
    };

    const result = validateCommand(command);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Name must be alphanumeric with hyphens only",
    );
  });

  test("should reject command with empty description", () => {
    const command = {
      name: "test-command",
      description: "   ",
      template: "Test template",
    };

    const result = validateCommand(command);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Description is required and cannot be empty",
    );
  });

  test("should reject command with empty template", () => {
    const command = {
      name: "test-command",
      description: "Test description",
      template: "",
    };

    const result = validateCommand(command);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Template is required and cannot be empty");
  });

  test("should reject command with invalid agent", () => {
    const command = {
      name: "test-command",
      description: "Test description",
      template: "Test template",
      agent: "invalid-agent",
    };

    const result = validateCommand(command);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Agent must be one of: general, plan, build, explore",
    );
  });
});
