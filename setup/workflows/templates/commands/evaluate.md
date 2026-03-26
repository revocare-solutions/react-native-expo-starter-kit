Scan the codebase and regenerate workflow files to match the current project state.

## What to scan

1. **Features:** List all directories in `src/features/`
2. **Providers:** For each feature, list files in `src/features/{name}/providers/`
3. **Config:** Read `src/config/basekit.config.ts` — extract enabled features and providers
4. **Components:** List all `.tsx` files in `src/components/` and `src/components/ui/`
5. **Hooks:** List all `.ts` files in `src/hooks/`
6. **Routes:** List all route files in `src/app/` (recursively, including route groups)
7. **Dependencies:** Read `package.json` — extract dependency names
8. **Scripts:** Read `package.json` scripts section
9. **Commands:** List existing `.md` files in `.claude/commands/`

## How to regenerate CLAUDE.md

Rewrite CLAUDE.md with these sections in order:

1. **Header:** `# {app name from basekit.config.ts}`
2. **Tech Stack:** List runtime, language, navigation, styling, and only technologies for features that exist in `src/features/`
3. **Project Structure:** Show actual `src/` directory structure
4. **Commands:** List all pnpm scripts from `package.json`
5. **Path Aliases:** `@/*` → `src/*`, `@assets/*` → `assets/*`
6. **Code Style:** TypeScript strict, NativeWind className, kebab-case files, PascalCase components, path aliases, named exports
7. **Component Patterns:** `src/components/`, `src/components/ui/`, `_components/` subfolders
8. **Routing:** expo-router conventions, route groups, `_layout.tsx`
9. **Git Workflow:** `ft/`, `fix/`, `refactor/` branches, conventional commits
10. **Feature Architecture:** Show the standard feature module pattern
11. **Feature Guide:** For each feature directory in `src/features/`, add a section with:
    - Key files (provider, hooks, service interface if it exists)
    - The active provider (from config or by checking which provider files exist)
    - Development patterns (how to extend, how to use hooks)

## How to manage commands

Check each command in `.claude/commands/`:
- If `add-provider.md` exists but no feature has a `providers/` directory → delete it
- If features with providers exist but `add-provider.md` is missing → create it with the standard template

Do NOT add or remove other commands — they are user-selected.

## After regenerating

1. Show a summary of what changed
2. Commit: `git add CLAUDE.md .claude/ && git commit -m "chore: update workflow files via /evaluate"`
