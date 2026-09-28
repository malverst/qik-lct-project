---
name: finni-content
description: Create and maintain Finni's data-driven tasks, purchases, savings goals, pet stages, and educational content separately from UI and game logic.
compatibility: opencode
---

# Finni Content

Content must be data-driven and separated from rendering and domain logic.

## Minimum demo content

The specification requires:
- 9 visually distinct pet combinations;
- 5 sequential periods;
- 6 financial tasks across 3 topics;
- 8 purchases across mandatory and optional types;
- 3 savings goals;
- 3 pet development stages.

## Required task topics

Use all three:
1. budget planning;
2. savings;
3. payments/purchases.

Tasks must be game situations with choices and consequences.

## Suggested initial tasks

These are the agreed project starting points; adapt wording and values to the actual economy implementation:

1. Allocate 100 coins between mandatory expenses and a goal.
2. Fix a budget after a mandatory expense becomes more expensive.
3. Choose a reasonable savings contribution.
4. Decide whether to buy a desired item or keep saving.
5. Compare purchases and stay within the planned amount.
6. React to an unexpected house expense by deciding which optional purchase to skip.

## Goals

- Gaming console — 150 coins.
- Big house — 250 coins.
- Rare pet item — 400 coins.

## Purchases

Use at least:
- mandatory: food, care, safe house-maintenance situations;
- optional: clothes, jewelry, entertainment.

Purchases must have:
- id;
- name;
- category/type;
- price;
- short child-friendly description;
- expected pet influence where applicable.

## Content quality

- Russian language.
- Short sentences suitable for ages 7–11.
- No shame, fear, death, illness, or implication that real money is required.
- Explain cause and effect.
- Do not put content strings directly into complex UI components when a data structure is more appropriate.

When adding content, update the content registry and relevant tests rather than changing core logic.
