---
name: finni-game-logic
description: Implement and review Finni's economy, budget PLAN vs FACT, tasks, energy, purchases, savings, goals, periods, and cat progression without breaking game rules.
compatibility: opencode
---

# Finni Game Logic

Treat the following as domain invariants.

## Economy

- Currency is fictional `coins`.
- Every coin gain/loss must have an explicit reason and amount.
- Balance must never become negative.
- Insufficient funds must explain why and offer a safe alternative where appropriate.
- Financial task rewards are the main source of earned coins.
- Never silently mutate the balance.

## Budget

The child first creates a budget PLAN from the available amount.

The plan must contain at least:
- mandatory expenses;
- optional expenses;
- savings.

The plan total cannot exceed the available budget.

Planning does not itself spend coins.

During the period, actual purchases and savings create FACT.

At period end, compare PLAN and FACT and explain the result simply.

## Expenses

Mandatory situations include food, care, and safe home/house maintenance situations such as a leaking tap. Do not introduce illness, injury, death, or medical punishment.

Optional expenses include clothes, jewelry, and entertainment.

Sleep/rest is not a harmful consequence. It is the energy system that limits task activity.

## Energy and sleep

- Tasks consume energy.
- Energy prevents the child from completing all tasks in one sitting.
- Rest/sleep restores energy.
- The mechanic should feel like a normal pet routine, not a punishment.
- Never make the child wait for real calendar time in demo mode.

## Tasks

Tasks are game situations with choices and consequences, not bare quizzes.

After every answer/action:
1. explain what happened;
2. show the relevant consequence;
3. give the next useful action.

Wrong decisions must be recoverable through mechanisms such as:
- an extra task;
- adjusting the next budget;
- skipping an optional purchase.

## Savings and goals

Minimum goals:
- gaming console — 150 coins;
- big house — 250 coins;
- rare pet item — 400 coins.

Show:
- goal cost;
- saved amount;
- remaining amount.

Withdrawals require confirmation and an explanation of the effect.

## Period completion

A financial period ends when its active goal is closed.

At completion:
- preserve the period's history;
- compare PLAN and FACT;
- update learning/progress;
- evaluate pet-development criteria;
- move to the next period.

## Pet progression

Stages:
1. kitten;
2. teenager;
3. adult.

Progress should use cumulative behavior across periods:
- mandatory expenses satisfied;
- actual spending aligned with the plan;
- regular savings.

Explain state changes briefly and positively.

## Architecture

Use pure/domain functions where practical.

Do not implement:
`setCoins(coins - price)` in a UI component.

Prefer domain operations such as:
- `rewardTask`
- `makePurchase`
- `saveCoins`
- `withdrawSavings`
- `completePeriod`
- `restoreEnergy`

Names may differ to fit the existing codebase.
