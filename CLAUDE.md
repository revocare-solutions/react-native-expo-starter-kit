# React Native Expo Starter Kit

## Project Overview
React Native Expo app with TypeScript, NativeWind (TailwindCSS), and expo-router.

## Tech Stack
- **Runtime**: Expo SDK 54 with React Native 0.81
- **Language**: TypeScript (strict mode)
- **Navigation**: expo-router (file-based routing)
- **Styling**: NativeWind v4 + TailwindCSS 3.4
- **Animations**: react-native-reanimated
- **Package Manager**: pnpm

## Project Structure
```
src/
├── app/              # File-based routes (expo-router)
│   ├── _layout.tsx   # Root layout
│   ├── modal.tsx     # Modal screen
│   └── (tabs)/       # Tab navigation group
│       ├── _layout.tsx
│       ├── index.tsx
│       └── explore.tsx
├── components/       # Reusable components
│   └── ui/           # Base UI components
├── constants/        # Theme and config constants
└── hooks/            # Custom React hooks
assets/               # Images, fonts, static files
```

## Path Aliases
- `@/*` → `src/*`
- `@assets/*` → `assets/*`

## Commands
- `pnpm start` — Start Expo dev server
- `pnpm android` — Start on Android
- `pnpm ios` — Start on iOS
- `pnpm web` — Start on web
- `pnpm lint` — Run ESLint (`expo lint`)
- `pnpm run reset-project` — Reset to clean state

## Development Guidelines

### Code Style
- Use TypeScript with strict mode — no `any` types
- Use NativeWind className for styling (not StyleSheet.create)
- Use kebab-case for file names (e.g., `my-component.tsx`)
- Use PascalCase for component names
- Use path aliases (`@/`, `@assets/`) for imports — never relative paths like `../../`
- Functional components with hooks only — no class components

### Component Patterns
- Place reusable components in `src/components/`
- Place base/primitive UI components in `src/components/ui/`
- Place screen-specific components alongside their route files or in a `_components/` subfolder
- Export components as named exports (not default)

### Routing
- All routes live in `src/app/` following expo-router conventions
- Use route groups `(groupName)` for layout organization
- Shared layouts use `_layout.tsx` files

### Git Workflow
- Branch naming: `ft/<feature-name>`, `fix/<bug-name>`, `refactor/<description>`
- Commit messages: conventional commits (feat:, fix:, refactor:, docs:, chore:)
- Always create feature branches — never commit directly to `main`
- Run `pnpm lint` before committing

### Agentic Workflow Rules
- When implementing features: create a branch, implement, lint, then offer to commit
- When fixing bugs: investigate first, then fix, test, and verify
- Run `pnpm lint` after making code changes to catch issues early
- Use git worktrees for parallel independent work when appropriate
- Prefer small, focused commits over large monolithic ones
