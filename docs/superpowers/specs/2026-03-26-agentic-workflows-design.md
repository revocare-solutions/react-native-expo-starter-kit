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

## 8. Quick Mode Defaults

`pnpm run setup --quick` defaults:
- workflow: `manual`
- agents: `[]`
- commands: `[]`

This keeps quick mode fast — no workflow file generation. Developers can add agentic workflows later by manually creating CLAUDE.md or running the evaluate pattern.
