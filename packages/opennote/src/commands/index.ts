import { PredefinedCommand } from "../types/index.js";

export const PREDEFINED_COMMANDS: PredefinedCommand[] = [
  {
    name: "daily-note",
    description:
      "Create a structured daily note with priorities, tasks, and reflections",
    template: `# Daily Note - {{DATE}}

## 🎯 Top 3 Priorities

1. 
2. 
3. 

## 📋 Tasks

- [ ] High priority task
- [ ] Medium priority task
- [ ] Low priority task

## 💭 Quick Notes

Capture fleeting thoughts, reminders, or important information.

- Bullet point for quick capture
- Another thought or reminder

## ✅ Completed

Celebrate wins and track what you accomplished.

- [x] Task completed today
- [x] Another achievement

## 🌟 Reflection

**What went well?**


**What could be improved?**


**What am I grateful for?**


## 📌 Tomorrow's Focus

- 
- 
- 

## 🔗 Links

- Related notes: [[NOTE_ID]]
- External resources: [Link description](url)

---
*Created at {{DATE}}*
`,
    agent: "general",
  },
  {
    name: "meeting-note",
    description:
      "Create comprehensive meeting notes with preparation, discussion, and follow-ups",
    template: `# Meeting Note

**Date:** {{DATE}}
**Time:** {{START_TIME}} - {{END_TIME}}
**Meeting Type:** {{TYPE}}
**Location/Platform:** {{LOCATION}}
**Facilitator:** {{FACILITATOR}}

## 👥 Attendees

- Name 1 - Role/Department
- Name 2 - Role/Department
- Name 3 - Role/Department
- Name 4 - Role/Department

## 📋 Pre-meeting Notes

**Purpose of this meeting:**


**Documents to review:**


**Questions to ask:**


## 🎯 Agenda & Discussion

### 1. Agenda Item 1
**Discussion:**

**Decision:**

**Owner:** 

### 2. Agenda Item 2
**Discussion:**

**Decision:**

**Owner:** 

### 3. Agenda Item 3
**Discussion:**

**Decision:**

**Owner:** 

## ✅ Action Items

| Action Item | Owner | Due Date | Status |
|-------------|-------|----------|--------|
| Action description | Name | Date | 🔴 Not Started |
| Action description | Name | Date | 🟡 In Progress |
| Action description | Name | Date | 🟢 Completed |

## 📝 Key Takeaways

1. 
2. 
3. 

## ❓ Open Questions

- Question 1: (Who to follow up with?)
- Question 2: (Who to follow up with?)

## 📅 Next Meeting

**Date:** 
**Agenda:** 

## 🔗 References

- Related documents: [[DOC_ID]]
- Previous meeting: [[MEETING_ID]]

---
*Meeting ID: {{MEETING_ID}}*
`,
    agent: "general",
  },
  {
    name: "idea-note",
    description:
      "Capture and develop ideas with structured analysis and implementation planning",
    template: `# Idea Note

**Title:** {{TITLE}}
**Created:** {{DATE}}
**Status:** 💡 Draft

## 📌 One-Liner Pitch

Summarize your idea in one compelling sentence (elevator pitch).

## 🎯 Problem Statement

What problem does this idea solve? Be specific about the pain points.

## 💡 The Solution

Describe your solution clearly and concisely. How does it address the problem?

## 📊 Impact Analysis

### Expected Benefits
- Benefit 1:
- Benefit 2:
- Benefit 3:

### Success Metrics
- Metric 1: (How will you measure success?)
- Metric 2: (Quantifiable goals)
- Metric 3: (KPIs)

### Resources Required
- Time: 
- Budget:
- Team/Expertise:
- Tools/Technology:

## 🗺️ Implementation Roadmap

### Phase 1: Planning
- [ ] Research and validation
- [ ] Stakeholder alignment
- [ ] Define requirements

### Phase 2: Development
- [ ] Build prototype/MVP
- [ ] Test and iterate
- [ ] Gather feedback

### Phase 3: Launch
- [ ] Prepare launch materials
- [ ] Execute rollout plan
- [ ] Monitor results

## ⚠️ Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| Risk 1 | High/Medium/Low | High/Medium/Low | Strategy to address |
| Risk 2 | High/Medium/Low | High/Medium/Low | Strategy to address |

## 🔄 Alternatives Considered

What other approaches did you consider? Why did you choose this one?

1. Alternative 1: 
2. Alternative 2: 

## 🔗 Related Ideas & Resources

- Related notes: [[NOTE_ID]]
- Inspiration source: [URL or reference]
- Similar concepts: [[IDEA_ID]]

## ✅ Next Steps

- [ ] Immediate action (this week)
- [ ] Short-term action (this month)
- [ ] Long-term action (this quarter)

---
*Idea ID: {{IDEA_ID}}*
*Category: {{CATEGORY}}*
*Priority: {{PRIORITY}}*
`,
    agent: "general",
  },
  {
    name: "zettel-note",
    description:
      "Create atomic zettelkasten card notes with permanent IDs and networked thinking",
    template: `# Zettel Note

**ID:** {{ZETTEL_ID}}
**Created:** {{DATE}}
**Modified:** {{DATE}}

## 💎 Core Idea

Write a single, atomic idea that can stand on its own. Keep it concise (1-2 sentences). This should be the essence of your note.

Example: "Atomic notes focus on one idea only, making them easier to link and reuse across different contexts."

## 📖 Explanation

Elaborate on the core idea. Provide context, examples, or deeper understanding while maintaining atomicity. Ask yourself:

- Why is this idea important?
- What are the key nuances?
- How does this work in practice?

Expand with 2-4 paragraphs that clarify and support the core idea.

## 🔗 References

### Links to Other Notes
Connect to related zettels. Use double-bracket syntax for bi-directional linking.

- [[NOTE_ID]]: Brief context about why this link matters
- [[NOTE_ID]]: How this note relates
- [[NOTE_ID]]: Supporting or contrasting idea

### Sources
Where did this idea come from? Give proper attribution.

- **Book:** Author, Title, Year, Page(s)
- **Article:** Title, Publication, URL, Date
- **Video/Video:** Title, Creator, Timestamp
- **Conversation:** Person, Date, Context
- **Original thought:** Mark as [Original]

## 🏷️ Tags

Use descriptive tags for categorization and discovery. Use consistent tag conventions.

#topic #subtopic #concept #domain #perspective

**Suggested tags:** Replace with relevant tags for your note system

## 💭 Context & Relevance

**When to use this idea:** In what situations does this insight apply?

**Why it matters now:** What makes this relevant in your current work or thinking?

**Future connections:** How might this connect to future ideas?

## 🎯 Application & Examples

**Practical use case:** How would you apply this in real life?

**Counter-examples:** When does this NOT apply? What are the limitations?

**Key questions raised:** What questions does this idea provoke?

## 📝 Personal Notes

Your thoughts, reactions, or questions about this idea. These are for personal context and won't appear in the final output.

---
*Zettelkasten ID: {{ZETTEL_ID}}*
*Links: {{LINK_COUNT}}*
*Tags: {{TAG_COUNT}}*
`,
    agent: "general",
  },
  {
    name: "project-note",
    description:
      "Create comprehensive project planning and tracking notes with goals, milestones, and resources",
    template: `# Project Note

**Project Name:** {{PROJECT_NAME}}
**Status:** 🟢 Planning / 🟡 In Progress / 🟡 On Hold / 🔴 Blocked / ✅ Completed
**Created:** {{DATE}}
**Last Updated:** {{DATE}}

## 🎯 Project Overview

### Vision Statement
What is the ultimate goal of this project? What impact will it have?

### Project Scope
**In scope:**


**Out of scope:**


### Success Criteria
- [ ] Criteria 1: (Measurable outcome)
- [ ] Criteria 2: (Measurable outcome)
- [ ] Criteria 3: (Measurable outcome)

## 📅 Timeline & Milestones

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Milestone 1 | Date | Date | 🟢/🟡/🔴 |
| Milestone 2 | Date | Date | 🟢/🟡/🔴 |
| Milestone 3 | Date | Date | 🟢/🟡/🔴 |

**Start Date:** 
**End Date:** 
**Current Phase:** 

## 👥 Team & Stakeholders

**Project Manager:** 

**Team Members:**
- Name - Role - Responsibilities

**Stakeholders:**
- Name - Role - Interests

## 📋 Deliverables

| Deliverable | Owner | Due Date | Status |
|-------------|-------|----------|--------|
| Deliverable 1 | Name | Date | 🟢/🟡/🔴 |
| Deliverable 2 | Name | Date | 🟢/🟡/🔴 |

## 🏗️ Work Breakdown

### Phase 1: Phase Name
**Duration:** 
**Goal:** 

**Tasks:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Phase 2: Phase Name
**Duration:** 
**Goal:** 

**Tasks:**
- [ ] Task 1
- [ ] Task 2

## 📊 Budget & Resources

**Budget Allocated:** 
**Budget Spent:** 
**Remaining:** 

**Resources:**
- Tool 1:
- Tool 2:
- Other resources:

## ⚠️ Risks & Issues

| Risk/Issue | Priority | Owner | Status | Mitigation/Resolution |
|------------|----------|-------|--------|---------------------|
| Risk 1 | High/Medium/Low | Name | Open/Closed | Action plan |
| Issue 2 | High/Medium/Low | Name | Open/Closed | Resolution |

## 📝 Notes & Decisions

### Key Decisions
- **Date:** Decision description and rationale
- **Date:** Decision description and rationale

### Meeting Notes
- **[Date]** Meeting summary and key points

### Lessons Learned
- What went well:
- What could be improved:
- What to do differently next time:

## 🔗 Related Resources

- Documents: [[DOC_ID]]
- Related projects: [[PROJECT_ID]]
- External resources: [Link](URL)

---
*Project ID: {{PROJECT_ID}}*
*Phase: {{CURRENT_PHASE}}*
*Progress: {{PERCENTAGE}}%*
`,
    agent: "general",
  },
  {
    name: "learning-note",
    description:
      "Document learning with concepts, insights, and action items for knowledge retention",
    template: `# Learning Note

**Topic:** {{TOPIC}}
**Date Learned:** {{DATE}}
**Source/Context:** {{SOURCE}}
**Learning Type:** 📚 Reading / 🎓 Course / 💻 Tutorial / 🎥 Video / 👥 Workshop / 🔄 Experience

## 🎯 Learning Objective

What did you set out to learn? Why is this important?

## 📖 Key Concepts

### Concept 1
**Definition:** 
**Example:** 
**Why it matters:** 

### Concept 2
**Definition:** 
**Example:** 
**Why it matters:** 

### Concept 3
**Definition:** 
**Example:** 
**Why it matters:** 

## 💡 Key Insights

**Insight 1:** (An "aha!" moment or new understanding)

**Insight 2:** 

**Insight 3:** 

## 🔗 Connections

### To Previous Knowledge
How does this connect to what you already know?

- Links to related notes: [[NOTE_ID]]
- Similar concepts learned before:

### To Future Applications
How might you use this in the future?

### Across Domains
Does this concept apply in other areas?

## 🤔 Questions & Clarifications

**Questions I still have:**

- Question 1: (What needs more exploration?)
- Question 2: 
- Question 3: 

**Areas of confusion:**

## 📝 Notes & Observations

Additional details, examples, or thoughts that don't fit elsewhere.

## ✅ Practical Application

### How I Plan to Use This
- Application 1: 
- Application 2: 
- Application 3: 

### Practice Exercises
- [ ] Exercise 1: (Specific practice task)
- [ ] Exercise 2: 
- [ ] Exercise 3: 

### Teaching Others
How would you explain this to someone else? (Teaching reinforces learning)

## 📚 Additional Resources

- Resource 1: [Title/URL](link) - Why it's useful
- Resource 2: [Title/URL](link) - Why it's useful
- Resource 3: [Title/URL](link) - Why it's useful

## 🔄 Review Plan

**Next review date:** 

**Review questions:**
- Do I still understand this?
- Have I applied this? How?
- What new insights have emerged?

---
*Learning ID: {{LEARNING_ID}}*
*Mastery Level:* ⭐⭐☆☆☆
*Reviewed:* {{REVIEW_COUNT}} times
`,
    agent: "general",
  },
];
