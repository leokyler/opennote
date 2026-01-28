import { describe, test, expect } from "vitest";
import type { PredefinedCommand } from "../../src/types";
import {
  formatCommandList,
  generateSuccessMessage,
  generateUsageExamples,
} from "../../src/utils/feedback";

describe("feedback utility", () => {
  const mockCommands: PredefinedCommand[] = [
    {
      name: "daily-note",
      description: "Create a daily note with date header",
      template: "Daily note template",
      agent: "general",
    },
    {
      name: "meeting-note",
      description: "Create a meeting note with attendees and agenda",
      template: "Meeting note template",
      agent: "general",
    },
    {
      name: "idea-note",
      description: "Create an idea note with title and description",
      template: "Idea note template",
      agent: "general",
    },
  ];

  test("should format command list correctly", () => {
    const formatted = formatCommandList(mockCommands);

    expect(formatted).toContain("daily-note");
    expect(formatted).toContain("Create a daily note with date header");
    expect(formatted).toContain("meeting-note");
    expect(formatted).toContain(
      "Create a meeting note with attendees and agenda",
    );
    expect(formatted).toContain("idea-note");
    expect(formatted).toContain(
      "Create an idea note with title and description",
    );
  });

  test("should generate success message with command count", () => {
    const message = generateSuccessMessage(3);

    expect(message).toContain("3");
    expect(message).toContain("commands");
  });

  test("should handle singular command count", () => {
    const message = generateSuccessMessage(1);

    expect(message).toContain("1");
    expect(message).toContain("command");
  });

  test("should generate usage examples for all commands", () => {
    const examples = generateUsageExamples(mockCommands);

    expect(examples).toContain("opennote daily-note");
    expect(examples).toContain("opennote meeting-note");
    expect(examples).toContain("opennote idea-note");
  });

  test("should format empty command list", () => {
    const formatted = formatCommandList([]);

    expect(formatted).toBeDefined();
  });

  test("should handle zero command count in success message", () => {
    const message = generateSuccessMessage(0);

    expect(message).toContain("0");
  });
});
