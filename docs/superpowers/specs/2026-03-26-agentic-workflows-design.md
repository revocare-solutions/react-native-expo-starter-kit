# Agentic Workflows Feature Design

## Overview

Generate AI agent workflow files (CLAUDE.md, settings, slash commands) during `pnpm run setup` based on the developer's selected features, providers, and preferences. The generated files give AI coding agents full project context and reusable commands tailored to the actual codebase — no dead references to stripped features.

A self-updating `/evaluate` command keeps workflow files in sync as the project evolves.

**Scope:** Claude Code workflows only (Phase 1). Cursor, Gemini, and other agents planned for future phases.

---

## 1. Setup Wizard Flow

### New Prompts

Added after feature selection, before the generation steps:

```
◇  Development workflow
   ● Agentic — Generate AI agent workflow files
   ○ Manual — Minimal project context only

◇  Select agent (if agentic)
   ◼ Claude Code

◇  Select workflow commands (if Claude Code)
   ◼ /add-feature — Scaffold a new feature module
   ◼ /new-screen — Create a new route/screen
   ◼ /add-provider — Add provider to existing feature
   ◼ /run-checks — Lint + typecheck + test
   ◼ /new-component — Scaffold a component
   ◼ /create-issue — Create a GitHub issue
   ◼ /create-branch — Create a feature branch
   ◼ /evaluate — Scan codebase and update workflow files
```

### SetupAnswers Extension

```typescript
interface SetupAnswers {
  // ... existing fields
  workflow: 'agentic' | 'manual';
  agents: string[];              // ['claude-code'] for now
  commands: string[];            // ['add-feature', 'new-screen', ...]
}
```

### What Gets Generated

| Mode | CLAUDE.md | .claude/settings.json | .claude/commands/ |
|------|-----------|----------------------|-------------------|
| Manual | Minimal (tech stack, structure, commands) | No | No |
| Agentic + Claude Code | Full (context + conventions + feature guides) | Yes | Selected commands |

---

## 2. File Structure

### Generated Files (in scaffolded project)

```
project/
├── CLAUDE.md                          # Full or minimal based on mode
├── .claude/
│   ├── settings.json                  # Pre-configured permissions
│   └── commands/
│       ├── add-feature.md
│       ├── new-screen.md
│       ├── add-provider.md
│       ├── run-checks.md
│       ├── new-component.md
│       ├── create-issue.md
│       ├── create-branch.md
│       └── evaluate.md
```

### Source Files (in repo before setup, deleted after)

```
setup/
├── workflows/
│   ├── registry.ts                    # Command + feature section definitions
│   ├── generate-claude-md.ts          # Assembles CLAUDE.md
│   ├── generate-settings.ts           # Builds .claude/settings.json
│   ├── generate-commands.ts           # Renders selected command files
│   └── templates/
│       ├── commands/
│       │   ├── add-feature.md
│       │   ├── new-screen.md
│       │   ├── add-provider.md
│       │   ├── run-checks.md
│       │   ├── new-component.md
│       │   ├── create-issue.md
│       │   ├── create-branch.md
│       │   └── evaluate.md
│       └── sections/
│           ├── header.md
│           ├── conventions.md
│           └── feature-guide.md
```

---

## 3. Registry

Central data structure used by all generators. Both setup and `/evaluate` use the same rules.

### Command Definitions

```typescript
interface CommandDefinition {
  id: string;
  name: string;                    // Display name in wizard
  description: string;             // Hint text
  templateFile: string;            // Path to .md template
  requiredFeatures?: string[];     // Only include if these features exist
}
```

Commands:

| ID | Name | Required Features |
|----|------|------------------|
| `add-feature` | /add-feature | — |
| `new-screen` | /new-screen | — |
| `add-provider` | /add-provider | Any feature with providers |
| `run-checks` | /run-checks | — |
| `new-component` | /new-component | — |
| `create-issue` | /create-issue | — |
| `create-branch` | /create-branch | — |
| `evaluate` | /evaluate | — |

### Feature Section Definitions

```typescript
interface FeatureSectionDefinition {
  featureKey: string;
  title: string;
  files: string[];                 // Key files to reference
  patterns: string[];              // Development guidance
}
```

Each enabled feature gets a section in CLAUDE.md with:
- Key file paths (service interface, provider, hooks)
- How to extend it (add provider, modify behavior)
- Testing guidance

---

## 4. CLAUDE.md Content

### Manual Mode (minimal)

```markdown
# {appName}

## Tech Stack
(only selected tech — dynamically generated)

## Project Structure
(generated from actual src/ directory)

## Commands
(pnpm scripts from package.json)
```

### Agentic Mode (full)

Adds on top of minimal:

```markdown
## Path Aliases
- @/* → src/*
- @assets/* → assets/*

## Code Style
- TypeScript strict mode — no any types
- NativeWind className for styling (not StyleSheet.create)
- kebab-case for file names
- PascalCase for component names
- Path aliases for imports — never relative paths
- Functional components with hooks only
- Named exports for components

## Component Patterns
- Reusable: src/components/
- Base UI: src/components/ui/
- Screen-specific: _components/ subfolder
- Named exports only

## Routing
- Routes in src/app/ (expo-router conventions)
- Route groups (groupName) for layout organization
- Shared layouts: _layout.tsx files

## Git Workflow
- Branch naming: ft/<feature>, fix/<bug>, refactor/<description>
- Conventional commits: feat:, fix:, refactor:, docs:, chore:
- Always feature branches — never commit directly to main
- Run pnpm lint before committing

## Feature Architecture
Each feature follows:
  src/features/<name>/
  ├── <name>-provider.tsx
  ├── create-<name>-service.ts
  ├── no-op-<name>.ts
  ├── hooks/
  ├── providers/
  └── __tests__/

## Feature Guide

### Authentication
- Service interface: src/services/auth.interface.ts
- Provider: {provider} at src/features/auth/providers/{provider}.ts
- Auth state: managed in AuthProvider via React Context
- To add a new provider: implement AuthService, add to create-auth-service.ts

### Theme System
- Tokens: src/config/theme.config.ts
- Runtime: useTheme() hook
- Tailwind: auto-generated from tokens
- To customize: edit theme.config.ts only

{... one section per selected feature}
```

---

## 5. Slash Commands

### /add-feature

Scaffold a new feature module. Asks for feature name, whether it needs providers, whether it needs a provider chain entry. Creates the full directory structure with provider, hooks, tests, barrel export, service interface, and types. Follows TDD. Runs /evaluate after.

### /new-screen

Create a new route/screen. Asks for screen name, route group, whether it needs a layout. Creates the file following existing patterns with ThemedView, ThemedText, NativeWind.

### /add-provider

Add a new provider to an existing feature. Asks which feature and provider name. Reads the service interface, creates the provider implementation, adds to factory, updates config type, writes tests, runs /evaluate.

### /run-checks

Runs `pnpm lint`, `pnpm typecheck`, `pnpm test --no-coverage` in sequence. Reports pass/fail for each. Investigates and suggests fixes on failure.

### /new-component

Create a reusable component. Asks for name and location (ui/ or components/). Uses NativeWind, useTheme()/useThemeColors(), named export, TypeScript props interface.

### /create-issue

Create a GitHub issue. Asks for title, description, labels. Runs `gh issue create`. Falls back to formatted output if gh not installed.

### /create-branch

Create a branch following naming convention. Asks for type and description. Maps to ft/, fix/, refactor/ prefix. Checks out main, pulls, creates branch.

### /evaluate

Self-contained codebase scanner and workflow file regenerator. Scans:
- `src/features/` — which features exist
- `src/features/*/providers/` — which providers per feature
- `src/config/basekit.config.ts` — enabled features and providers
- `src/components/` — available components
- `src/hooks/` — available hooks
- `src/app/` — route structure
- `package.json` — dependencies and scripts
- `.claude/commands/` — which commands exist

Then regenerates:
- CLAUDE.md with accurate content
- .claude/commands/ — add/remove based on feature existence

Commits the changes.

---

## 6. /evaluate — Self-Updating Mechanism

### Two Entry Points, Same Rules

- **During setup:** TypeScript generators in `setup/workflows/` produce initial files
- **After setup:** `/evaluate` command (a self-contained markdown prompt) regenerates them by scanning the codebase

The `setup/` directory is deleted after setup. The `/evaluate` command embeds all generation rules in its prompt — no runtime dependencies on setup code.

### Detection Table

| Change | Action |
|--------|--------|
| New feature directory | Add feature guide section to CLAUDE.md |
| Feature directory removed | Remove section from CLAUDE.md |
| New provider file | Update feature guide with provider |
| New component | Update components list |
| New hook | Update hooks list |
| New route | Update route structure |
| Dependency added/removed | Update tech stack |
| No provider-based features remain | Remove /add-provider command |

---

## 7. .claude/settings.json

Pre-configured permissions so common commands don't prompt:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm lint)",
      "Bash(pnpm test*)",
      "Bash(pnpm typecheck)",
      "Bash(pnpm start*)",
      "Bash(git *)"
    ]
  }
}
```

---

## 8. Integration with Setup Wizard

### Step Sequence

Workflow generation inserts into the existing setup flow at step 8.5 — after theme handling, before pnpm install:

1. Update app.json
2. Strip feature files
3. Rewrite service factories
4. Rewrite app-providers.tsx
5. Update config
6. Clean package.json
7. Update .env.example
8. Handle theme
9. **Generate workflow files** (new step)
10. pnpm install
11. Self-destruct (removes `setup/` including `setup/workflows/`)
12. Git commit

This ordering ensures the generators can read the already-stripped codebase to produce accurate output, and the `setup/workflows/` source is still available.

### YAML Config File (`--from`) Extension

```yaml
# basekit.scaffold.yaml
app:
  name: my-app
  bundleId: com.acme.myapp
  scheme: myapp
theme: corporate
backend: supabase
features:
  - auth
  - analytics
  - security
workflow: agentic
agents:
  - claude-code
commands:
  - add-feature
  - new-screen
  - add-provider
  - run-checks
  - evaluate
```

If `workflow` is omitted, defaults to `manual`. If `agents` or `commands` are omitted when `workflow: agentic`, uses all available.

### Quick Mode Defaults

`pnpm run setup --quick` defaults:
- workflow: `manual`
- agents: `[]`
- commands: `[]`

### `getQuickDefaults()` Update

```typescript
export function getQuickDefaults(): SetupAnswers {
  return {
    // ... existing fields
    workflow: 'manual',
    agents: [],
    commands: [],
  };
}
```

---

## 9. Settings Permissions

Generated `.claude/settings.json` uses granular permissions matching Claude Code conventions:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm lint)",
      "Bash(pnpm test)",
      "Bash(pnpm test:*)",
      "Bash(pnpm typecheck)",
      "Bash(pnpm start)",
      "Bash(pnpm start:*)",
      "Bash(git status*)",
      "Bash(git log*)",
      "Bash(git diff*)",
      "Bash(git branch*)",
      "Bash(git checkout*)",
      "Bash(git add*)",
      "Bash(git commit*)",
      "Bash(git push*)",
      "Bash(git pull*)",
      "Bash(git fetch*)",
      "Bash(gh issue*)",
      "Bash(gh pr*)"
    ]
  }
}
```

Note: This is the settings for the **scaffolded project**, not for this repo. The Basekit repo itself has its own `.claude/settings.json` which is distinct.

---

## 10. Command Availability Logic

### `add-provider` Conditional

The `/add-provider` command requires at least one feature with swappable providers to be present. This cannot be expressed as a simple `requiredFeatures` string array.

```typescript
interface CommandDefinition {
  id: string;
  name: string;
  description: string;
  templateFile: string;
  condition?: (selectedFeatures: Record<string, string>, manifest: Manifest) => boolean;
}
```

For `add-provider`:
```typescript
{
  id: 'add-provider',
  condition: (selected, manifest) =>
    Object.keys(selected).some((f) => {
      const feature = manifest.features[f];
      return feature && Object.keys(feature.providers).length > 0;
    }),
}
```

Commands without a `condition` are always available (if selected by the user).

---

## 11. Template Interpolation

Templates use simple `{{variable}}` placeholders processed by string replacement. No template library needed — the generators do:

```typescript
function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}
```

Variables available to templates:
- `{{appName}}` — from setup answers
- `{{bundleId}}` — from setup answers
- `{{scheme}}` — from setup answers
- `{{features}}` — comma-separated list of enabled features
- `{{provider:featureName}}` — selected provider for a feature

Feature guide sections use a different approach — they are generated programmatically from the `FeatureSectionDefinition` registry, not from templates with conditionals.

---

## 12. `.gitignore` Handling

The `.claude/` directory should be committed to the scaffolded project — it's part of the developer experience. It is NOT added to `.gitignore`.

In manual mode, no `.claude/` directory is created, so nothing to manage.

---

## 13. Drift Prevention Between Setup Generators and /evaluate

The `/evaluate` command is the **canonical source of truth** for workflow file structure. The TypeScript generators in `setup/workflows/` are written to follow the same rules defined in the evaluate command's template.

To verify parity, the implementation should include an integration test that:
1. Runs setup with agentic mode
2. Runs `/evaluate` (simulated by calling the same scan + generate logic)
3. Asserts the output matches what setup produced

---

## 14. Feature Section Registry (All Features)

Complete registry entries for all features:

| Feature | Key Files | Guidance |
|---------|-----------|----------|
| auth | auth-provider.tsx, create-auth-service.ts, services/auth.interface.ts | Add providers in providers/, implement AuthService interface |
| analytics | analytics-provider.tsx, create-analytics-service.ts, services/analytics.interface.ts | Track events via useAnalytics(), add providers following amplify.ts pattern |
| crash-reporting | crash-reporting-provider.tsx, services/crash-reporting.interface.ts | Capture errors via useCrashReporting(), Sentry provider at providers/sentry.ts |
| notifications | notification-provider.tsx, services/notifications.interface.ts | Request permissions, send local notifications via useNotifications() |
| offline-storage | storage-provider.tsx, create-storage-service.ts, services/storage.interface.ts | Key-value storage via useStorage(), MMKV or AsyncStorage providers |
| i18n | i18n-provider.tsx, i18n.ts, locales/en.json | Add translations in locales/, use useAppTranslation() hook |
| forms | hooks/use-app-form.ts, components/form-input.tsx, schemas/common.ts | Zod schemas in schemas/, form components in components/ |
| security | security-provider.tsx, hooks/use-biometrics.ts, hooks/use-app-lock.ts, config/pinning.ts | Biometrics via useBiometrics(), secure storage via useSecureStorage(), SSL config in config/pinning.ts |
| theme | theme-provider.tsx, hooks/use-theme.ts, utils/generate-tailwind.ts, config/theme.config.ts | Edit theme.config.ts to change tokens, useTheme() for runtime values, Tailwind classes auto-update |
| onboarding | hooks/use-onboarding.ts, components/onboarding-screen.tsx | Completion persisted in Zustand store, check useOnboarding().shouldShow |
| deep-linking | hooks/use-deep-link.ts, utils/build-deep-link.ts | Monitor incoming URLs via useDeepLink(), build links with buildDeepLink() |
| ota-updates | hooks/use-ota-updates.ts | Check and apply updates via useOtaUpdates() |
| splash-app-icon | hooks/use-splash-screen.ts | Control splash visibility via useSplashScreen() |
