---
name: finni-review
description: Review the Finni app against PROJECT.md, AGENTS.md, the technical specification, game invariants, UX requirements, persistence, and demo readiness without making changes.
compatibility: opencode
---

# Finni Review

Use this skill when the user asks for a project review, TЗ compliance check, demo readiness check, or pre-hackathon audit.

## Review order

1. Read `PROJECT.md` and `AGENTS.md`.
2. Inspect the repository structure and package versions.
3. Inspect the relevant implementation.
4. Run appropriate read-only checks when possible.
5. Report findings; do not edit files unless the user explicitly asks for fixes.

## Check

### Product
- first launch/profile/pet flow;
- cat customization;
- coins;
- task rewards;
- budget PLAN;
- purchases as FACT;
- savings and active goal;
- period completion when goal closes;
- next period;
- history/progress;
- adult section;
- reset/delete.

### Economy
- no unexplained balance changes;
- no negative balance;
- insufficient-funds handling;
- savings correctness;
- plan-vs-fact correctness;
- period history preservation.

### Energy
- tasks consume energy;
- energy prevents completing everything in one sitting;
- rest/sleep restores energy;
- no punitive or harmful pet consequences.

### Content
- 5 sequential periods;
- 6+ tasks across 3 topics;
- 8+ purchases across 2 types;
- 3 goals;
- 3 cat stages;
- 9 distinct pet combinations.

### Persistence
- profile survives restart;
- balance survives restart;
- purchases/history survive restart;
- savings/goal survive restart;
- learning progress survives restart;
- reset/delete works.

### UX/safety
- child-friendly language;
- no shame/scare mechanics;
- no real-money implication;
- clear consequences;
- 48x48 dp controls;
- readable text;
- accessible feedback;
- destructive actions confirmed.

### Technical
- TypeScript correctness;
- Expo compatibility;
- Android behavior;
- no unnecessary backend;
- local storage robustness;
- reasonable component boundaries;
- content separated from UI;
- tests or detailed test cases for critical logic.

## Output

Use severity:
- CRITICAL — blocks demo or violates a core requirement.
- HIGH — important functional/specification issue.
- MEDIUM — meaningful quality or UX issue.
- LOW — polish or maintainability.

For every finding include:
- severity;
- file/path;
- concrete issue;
- why it matters;
- concise suggested direction.

End with:
1. blockers;
2. verified areas;
3. unverified areas;
4. recommended next steps.

Do not invent evidence. If something cannot be verified from the repository, mark it unverified.
