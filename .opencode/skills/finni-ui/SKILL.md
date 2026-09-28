---
name: finni-ui
description: Design and implement Finni's child-friendly visual interface: cartoon cat plus modern minimal UI, clear feedback, accessibility, and playful interactions.
compatibility: opencode
---

# Finni UI

## Visual direction

The agreed direction is:
- cartoon cat + modern interface;
- light theme;
- clean, rounded, friendly UI;
- interactive but not visually overloaded;
- clear hierarchy;
- concise Russian text.

The cat is the central visual character.

## Cat customization

One species: cat.

Customization should support:
- fur color changes;
- sweaters;
- hats;
- jewelry.

The demo should contain at least 9 visually distinct combinations.

## Child UX

The audience is 7–11.

Therefore:
- prefer short labels and short explanations;
- make primary actions obvious;
- use large touch targets;
- keep important information visible;
- do not require reading long paragraphs;
- use icons together with text where useful;
- never use color as the only signal;
- confirm destructive actions;
- give immediate visual feedback after financial actions.

## Main screen

The main screen should make the following easy to understand:
- cat;
- current coins;
- savings;
- active goal;
- important pet state;
- active financial task;
- navigation to budget, tasks, purchases, savings, progress, and adult section.

## Feedback

After important actions, show:
- what changed;
- why it changed;
- what the child can do next.

Animations may be used for:
- rewards;
- purchases;
- savings;
- cat progression;
- button feedback.

Do not make sound required for understanding.

## Accessibility and layout

Follow the project specification:
- portrait Android UI;
- readable main text;
- touch controls at least 48x48 dp;
- sufficient contrast;
- consistent navigation/back behavior;
- critical information must not be communicated only through sound.

## Implementation

- Keep reusable UI components small.
- Avoid putting game/economy logic in visual components.
- Prefer design tokens/theme values over scattered magic numbers.
- Keep animations cancelable and lightweight.
- Test important flows on a real Android device when available.
