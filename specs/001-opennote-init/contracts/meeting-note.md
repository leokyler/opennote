---
description: Create a meeting note with attendees and agenda
agent: general
---

Create a meeting note with the following structure:

# Meeting Note - {{topic}}

**Date**: {{date}}
**Attendees**: {{attendees}}
**Location**: {{location}}

## Agenda

1.
2.
3.

## Notes

-

## Action Items

- [ ] {{description}} (@{{assignee}})

## Next Meeting

- Date: {{date}}
- Topic: {{topic}}

Use today's date for {{date}} if not provided as an argument.
The {{attendees}} argument should be a comma-separated list of names.
