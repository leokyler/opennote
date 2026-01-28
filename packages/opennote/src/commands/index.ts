import { PredefinedCommand } from "../types/index.js";

export const PREDEFINED_COMMANDS: PredefinedCommand[] = [
  {
    name: "daily-note",
    description: "Create a daily note with date header",
    template: `# Daily Note

Date: {{DATE}}

## Notes

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Reflection

`,
    agent: "general",
  },
  {
    name: "meeting-note",
    description: "Create a meeting note with attendees and agenda",
    template: `# Meeting Note

Date: {{DATE}}
Type: {{TYPE}}

## Attendees

- 
- 
- 

## Agenda

1. 
2. 
3. 

## Action Items

- [ ] 
- [ ] 
- [ ] 

## Notes

`,
    agent: "general",
  },
  {
    name: "idea-note",
    description: "Create an idea note with title and description",
    template: `# Idea Note

Title: {{TITLE}}

## Description


## Category

- [ ] Feature Idea
- [ ] Bug Report
- [ ] Improvement
- [ ] Other

## Priority

- [ ] High
- [ ] Medium
- [ ] Low

## Notes

`,
    agent: "general",
  },
];
