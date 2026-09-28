---
name: react-native-expo
description: Practical React Native and Expo implementation rules for the Finni Android app. Use for screens, components, navigation, animations, Android behavior, and Expo configuration.
compatibility: opencode
---

# React Native + Expo

## Rules

- Target Android first.
- Follow the Expo version and dependencies already present in the repository; do not guess versions.
- Check official/current documentation through the configured documentation MCP when an API is version-sensitive.
- Prefer React Native primitives and existing project dependencies before adding libraries.
- Keep components focused and avoid giant screen files.
- Use TypeScript types for props, domain values, navigation params, and persisted data.
- Keep business/economy logic outside UI components.
- Handle loading, empty, disabled, error, and success states explicitly.
- Avoid blocking the UI thread with unnecessary synchronous work.
- Keep local interactions fast and responsive.
- Respect portrait orientation and the minimum-width/accessibility requirements from the specification.
- Interactive controls should be large enough for children; do not rely on color alone to communicate meaning.
- Destructive actions such as profile deletion/reset require confirmation.
- Animations should reinforce feedback and remain usable without sound.

## Expo verification

Before changing Expo configuration or using a version-sensitive API:
1. Inspect `package.json`.
2. Inspect `app.json`/`app.config.*`.
3. Use the project's installed Expo version.
4. Verify uncertain APIs in current Expo/React Native documentation.

## Avoid

- Native modules without a clear need.
- Overengineering navigation/state management.
- Web-only APIs in Android code.
- Hard-coded screen dimensions where responsive layout is appropriate.
- Business rules embedded in JSX.
