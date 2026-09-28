---
name: qik-project
description: Project-wide rules for the Finni children's financial-literacy game. Use when implementing, changing, planning, or reviewing any project feature.
compatibility: opencode
---

# QIK Project

You are working on the mobile app "Питомец Финни", a Russian-language Android game for children aged 7–11 that teaches basic financial literacy through a virtual cat.

## Before changing code

1. Read `PROJECT.md` and `AGENTS.md` if they exist.
2. Inspect the existing repository and `package.json`.
3. Inspect Expo configuration and TypeScript configuration.
4. Prefer the existing project structure over introducing a new architecture.
5. Do not invent requirements that contradict the project specification.

## Product invariants

- Platform: Android; Expo + React Native + TypeScript.
- Local guest profile; no mandatory registration.
- Local persistence with AsyncStorage.
- No backend.
- Currency is fictional coins.
- Money changes only through explicit game actions with a visible reason and amount.
- Budget allocation is a PLAN, not an immediate expense.
- Actual purchases are FACT.
- A period ends when its financial goal is closed.
- Financial tasks are the primary source of earned coins.
- The cat has three development stages: kitten -> teenager -> adult.
- Development depends on mandatory expenses being satisfied, actual spending matching the plan, and regular savings.
- Bad decisions never kill, injure, or shame the pet.
- Sleep/rest is an energy mechanic limiting how many tasks the child can complete in one sitting. Rest restores energy.
- The demo mode must allow all five periods without real-time waiting.

## Engineering rules

- Keep UI, game/domain logic, persistence, and content separated.
- Centralize all economy mutations in domain/game services or equivalent modules.
- Components must not directly manipulate coin balances, savings, purchase history, or period completion state.
- Keep game content data-driven so new tasks can be added without rewriting core logic.
- Prefer small, understandable TypeScript modules over speculative abstractions.
- Do not add a backend, authentication, analytics, ads, payments, or remote services unless explicitly requested.
- Do not add dependencies when the platform or existing dependency set already solves the problem.

## Delivery

After implementation, run the narrowest relevant checks available: TypeScript/build/lint/tests. Report what was run and any remaining limitation.
