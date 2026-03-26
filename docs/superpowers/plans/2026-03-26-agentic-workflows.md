# Agentic Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add agentic workflow file generation (CLAUDE.md, .claude/settings.json, slash commands) to the setup wizard, with a self-updating /evaluate command.

**Architecture:** A registry defines all commands and feature sections as data. Three generator functions read the registry + setup answers to produce files. The setup wizard calls generators after stripping features. The /evaluate command is a self-contained markdown prompt that re-scans and regenerates.

**Tech Stack:** TypeScript, fs-extra (already installed), @clack/prompts (already installed)

**Spec:** `docs/superpowers/specs/2026-03-26-agentic-workflows-design.md`

**Branch:** `ft/agentic-workflows` (already created)

---

## File Map

### New Files

```
setup/
├── workflows/
│   ├── registry.ts                    # Command + feature section definitions
│   ├── generate-claude-md.ts          # Assembles CLAUDE.md from registry + answers
│   ├── generate-settings.ts           # Builds .claude/settings.json
│   ├── generate-commands.ts           # Copies selected command templates
│   ├── __tests__/
│   │   ├── generate-claude-md.test.ts
│   │   └── generate-commands.test.ts
│   └── templates/
│       └── commands/
│           ├── add-feature.md
│           ├── new-screen.md
│           ├── add-provider.md
│           ├── run-checks.md
│           ├── new-component.md
│           ├── create-issue.md
│           ├── create-branch.md
│           └── evaluate.md
```

### Modified Files

```
setup/prompts.ts          # Add SetupAnswers fields + workflow/agent/command prompts
setup/index.ts            # Add workflow generation step + --from YAML parsing
```

---

## Task 1: Registry

**Files:**
- Create: `setup/workflows/registry.ts`

- [ ] **Step 1: Create the registry with command definitions and feature sections**

Create `setup/workflows/registry.ts` with all command definitions and feature section definitions. This is a data-only file — no logic, just structured definitions.

```typescript
import type { Manifest } from '../generator';

export interface CommandDefinition {
  id: string;
  name: string;
  description: string;
  templateFile: string;
  condition?: (selectedFeatures: Record<string, string>, manifest: Manifest) => boolean;
}

export interface FeatureSectionDefinition {
  featureKey: string;
  title: string;
  files: string[];
  patterns: string[];
}

export const commands: CommandDefinition[] = [
  {
    id: 'add-feature',
    name: '/add-feature',
    description: 'Scaffold a new feature module',
    templateFile: 'commands/add-feature.md',
  },
  {
    id: 'new-screen',
    name: '/new-screen',
    description: 'Create a new route/screen',
    templateFile: 'commands/new-screen.md',
  },
  {
    id: 'add-provider',
    name: '/add-provider',
    description: 'Add provider to existing feature',
    templateFile: 'commands/add-provider.md',
    condition: (selected, manifest) =>
      Object.keys(selected).some((f) => {
        const feature = manifest.features[f];
        return feature && Object.keys(feature.providers).length > 0;
      }),
  },
  {
    id: 'run-checks',
    name: '/run-checks',
    description: 'Lint + typecheck + test',
    templateFile: 'commands/run-checks.md',
  },
  {
    id: 'new-component',
    name: '/new-component',
    description: 'Scaffold a component',
    templateFile: 'commands/new-component.md',
  },
  {
    id: 'create-issue',
    name: '/create-issue',
    description: 'Create a GitHub issue',
    templateFile: 'commands/create-issue.md',
  },
  {
    id: 'create-branch',
    name: '/create-branch',
    description: 'Create a feature branch',
    templateFile: 'commands/create-branch.md',
  },
  {
    id: 'evaluate',
    name: '/evaluate',
    description: 'Scan codebase and update workflow files',
    templateFile: 'commands/evaluate.md',
  },
];

export const featureSections: FeatureSectionDefinition[] = [
  {
    featureKey: 'auth',
    title: 'Authentication',
    files: ['src/services/auth.interface.ts', 'src/features/auth/auth-provider.tsx', 'src/features/auth/create-auth-service.ts'],
    patterns: [
      'Service interface at src/services/auth.interface.ts — all providers implement this',
      'Add new providers in src/features/auth/providers/ following existing pattern',
      'Auth state managed in AuthProvider via React Context',
      'Token getter wired into API client automatically',
    ],
  },
  {
    featureKey: 'analytics',
    title: 'Analytics',
    files: ['src/services/analytics.interface.ts', 'src/features/analytics/analytics-provider.tsx', 'src/features/analytics/create-analytics-service.ts'],
    patterns: [
      'Track events via useAnalytics() hook',
      'Add providers following amplify.ts pattern in providers/',
    ],
  },
  {
    featureKey: 'crash-reporting',
    title: 'Crash Reporting',
    files: ['src/services/crash-reporting.interface.ts', 'src/features/crash-reporting/crash-reporting-provider.tsx'],
    patterns: [
      'Capture errors via useCrashReporting() hook',
      'Sentry provider at providers/sentry.ts',
    ],
  },
  {
    featureKey: 'notifications',
    title: 'Push Notifications',
    files: ['src/services/notifications.interface.ts', 'src/features/notifications/notification-provider.tsx'],
    patterns: [
      'Request permissions, send local notifications via useNotifications()',
      'Add providers following amplify.ts pattern',
    ],
  },
  {
    featureKey: 'offline-storage',
    title: 'Offline Storage',
    files: ['src/services/storage.interface.ts', 'src/features/offline-storage/storage-provider.tsx', 'src/features/offline-storage/create-storage-service.ts'],
    patterns: [
      'Key-value storage via useStorage() hook',
      'MMKV or AsyncStorage providers available',
    ],
  },
  {
    featureKey: 'i18n',
    title: 'Internationalization',
    files: ['src/features/i18n/i18n-provider.tsx', 'src/features/i18n/i18n.ts', 'src/features/i18n/locales/en.json'],
    patterns: [
      'Add translations in src/features/i18n/locales/',
      'Use useAppTranslation() hook in components',
    ],
  },
  {
    featureKey: 'forms',
    title: 'Forms & Validation',
    files: ['src/features/forms/hooks/use-app-form.ts', 'src/features/forms/components/form-input.tsx', 'src/features/forms/schemas/common.ts'],
    patterns: [
      'Zod schemas in schemas/, form components in components/',
      'Use useAppForm(schema) hook for form state',
    ],
  },
  {
    featureKey: 'security',
    title: 'Security',
    files: ['src/features/security/security-provider.tsx', 'src/features/security/hooks/use-biometrics.ts', 'src/features/security/hooks/use-app-lock.ts', 'src/features/security/config/pinning.ts'],
    patterns: [
      'Biometrics via useBiometrics() hook',
      'Secure storage via useSecureStorage() hook',
      'App lock via useAppLock() hook',
      'SSL pinning config in config/pinning.ts',
    ],
  },
  {
    featureKey: 'theme',
    title: 'Theme System',
    files: ['src/config/theme.config.ts', 'src/features/theme/hooks/use-theme.ts', 'src/features/theme/utils/generate-tailwind.ts'],
    patterns: [
      'Edit theme.config.ts to change design tokens — no component changes needed',
      'useTheme() hook for runtime values (colors, spacing, shadows)',
      'Tailwind classes auto-generated from tokens (bg-primary-500, etc.)',
      'useThemeColors() is a safe wrapper that falls back when theme is disabled',
    ],
  },
  {
    featureKey: 'onboarding',
    title: 'Onboarding',
    files: ['src/features/onboarding/hooks/use-onboarding.ts', 'src/features/onboarding/components/onboarding-screen.tsx'],
    patterns: [
      'Completion persisted in Zustand store',
      'Check useOnboarding().shouldShow to decide whether to show onboarding',
    ],
  },
  {
    featureKey: 'deep-linking',
    title: 'Deep Linking',
    files: ['src/features/deep-linking/hooks/use-deep-link.ts', 'src/features/deep-linking/utils/build-deep-link.ts'],
    patterns: [
      'Monitor incoming URLs via useDeepLink() hook',
      'Build links with buildDeepLink() utility',
    ],
  },
  {
    featureKey: 'ota-updates',
    title: 'OTA Updates',
    files: ['src/features/ota-updates/hooks/use-ota-updates.ts'],
    patterns: ['Check and apply updates via useOtaUpdates() hook'],
  },
  {
    featureKey: 'splash-app-icon',
    title: 'Splash Screen & App Icon',
    files: ['src/features/splash-app-icon/hooks/use-splash-screen.ts'],
    patterns: ['Control splash visibility via useSplashScreen() hook'],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add setup/workflows/registry.ts
git commit -m "feat: add agentic workflows registry with command and feature definitions"
```

---

## Task 2: CLAUDE.md Generator (TDD)

**Files:**
- Create: `setup/workflows/generate-claude-md.ts`
- Create: `setup/workflows/__tests__/generate-claude-md.test.ts`

- [ ] **Step 1: Write failing test**

Create `setup/workflows/__tests__/generate-claude-md.test.ts`:

```typescript
import { generateClaudeMd } from '../generate-claude-md';

describe('generateClaudeMd', () => {
  const baseAnswers = {
    appName: 'test-app',
    bundleId: 'com.test.app',
    scheme: 'testapp',
    features: { auth: 'amplify', i18n: '', theme: 'minimal' } as Record<string, string>,
  };

  it('should generate minimal CLAUDE.md for manual mode', () => {
    const result = generateClaudeMd({
      ...baseAnswers,
      workflow: 'manual' as const,
    });

    expect(result).toContain('# test-app');
    expect(result).toContain('## Tech Stack');
    expect(result).toContain('## Commands');
    // Should NOT contain agentic sections
    expect(result).not.toContain('## Code Style');
    expect(result).not.toContain('## Feature Guide');
  });

  it('should generate full CLAUDE.md for agentic mode', () => {
    const result = generateClaudeMd({
      ...baseAnswers,
      workflow: 'agentic' as const,
    });

    expect(result).toContain('# test-app');
    expect(result).toContain('## Code Style');
    expect(result).toContain('## Feature Architecture');
    expect(result).toContain('## Feature Guide');
    expect(result).toContain('### Authentication');
    expect(result).toContain('### Internationalization');
    expect(result).toContain('### Theme System');
  });

  it('should only include guides for selected features', () => {
    const result = generateClaudeMd({
      appName: 'test-app',
      bundleId: 'com.test.app',
      scheme: 'testapp',
      features: { auth: 'amplify' },
      workflow: 'agentic' as const,
    });

    expect(result).toContain('### Authentication');
    expect(result).not.toContain('### Theme System');
    expect(result).not.toContain('### Internationalization');
  });

  it('should include provider info in feature guides', () => {
    const result = generateClaudeMd({
      ...baseAnswers,
      workflow: 'agentic' as const,
    });

    expect(result).toContain('amplify');
    expect(result).toContain('src/services/auth.interface.ts');
  });
});
```

- [ ] **Step 2: Run test — should FAIL**

```bash
pnpm test -- setup/workflows/__tests__/generate-claude-md.test.ts --no-coverage
```

- [ ] **Step 3: Implement**

Create `setup/workflows/generate-claude-md.ts`:

```typescript
import { featureSections } from './registry';

interface GenerateOptions {
  appName: string;
  bundleId: string;
  scheme: string;
  features: Record<string, string>;
  workflow: 'agentic' | 'manual';
}

export function generateClaudeMd(options: GenerateOptions): string {
  const { appName, features, workflow } = options;
  const sections: string[] = [];

  // Header
  sections.push(`# ${appName}\n`);

  // Tech stack (always included)
  sections.push(generateTechStack(features));

  // Project structure (always included)
  sections.push(generateProjectStructure(features));

  // Commands (always included)
  sections.push(generateCommands());

  if (workflow === 'agentic') {
    sections.push(generatePathAliases());
    sections.push(generateCodeStyle());
    sections.push(generateComponentPatterns());
    sections.push(generateRouting());
    sections.push(generateGitWorkflow());
    sections.push(generateFeatureArchitecture());
    sections.push(generateFeatureGuide(features));
  }

  return sections.join('\n');
}

function generateTechStack(features: Record<string, string>): string {
  const lines = [
    '## Tech Stack',
    '- **Runtime**: Expo SDK 54 with React Native 0.81',
    '- **Language**: TypeScript (strict mode)',
    '- **Navigation**: expo-router (file-based routing)',
    '- **Styling**: NativeWind v4 + TailwindCSS 3.4',
    '- **Package Manager**: pnpm',
  ];

  if ('theme' in features) lines.push('- **Theming**: Design tokens via theme.config.ts');
  if ('auth' in features) lines.push(`- **Auth**: ${features.auth || 'configured'}`);
  if ('analytics' in features) lines.push(`- **Analytics**: ${features.analytics || 'configured'}`);
  if ('crash-reporting' in features) lines.push(`- **Crash Reporting**: ${features['crash-reporting'] || 'configured'}`);
  if ('i18n' in features) lines.push('- **i18n**: i18next + react-i18next');
  if ('forms' in features) lines.push('- **Forms**: React Hook Form + Zod');
  if ('security' in features) lines.push('- **Security**: expo-local-authentication + expo-secure-store');
  if ('offline-storage' in features) lines.push(`- **Storage**: ${features['offline-storage'] || 'configured'}`);

  return lines.join('\n') + '\n';
}

function generateProjectStructure(features: Record<string, string>): string {
  const featureDirs = Object.keys(features)
    .filter((f) => f !== 'theme')
    .map((f) => `│   ├── ${f}/`)
    .join('\n');

  const themeDir = 'theme' in features ? '\n│   ├── theme/' : '';

  return `## Project Structure
\`\`\`
src/
├── app/              # Expo Router file-based routes
├── components/       # Reusable components
│   └── ui/           # Base UI components
├── config/           # basekit.config.ts${themeDir ? ', theme.config.ts' : ''}
├── features/         # Feature modules
${featureDirs}${themeDir}
├── hooks/            # Shared React hooks
├── lib/              # Library wrappers (api, providers)
├── services/         # Service interfaces
├── store/            # Zustand stores
└── types/            # Shared TypeScript types
\`\`\`
`;
}

function generateCommands(): string {
  return `## Commands
- \`pnpm start\` — Start Expo dev server
- \`pnpm android\` — Start on Android
- \`pnpm ios\` — Start on iOS
- \`pnpm web\` — Start on web
- \`pnpm lint\` — Run ESLint
- \`pnpm typecheck\` — TypeScript type checking
- \`pnpm test\` — Run unit tests
- \`pnpm test:coverage\` — Test coverage report
`;
}

function generatePathAliases(): string {
  return `## Path Aliases
- \`@/*\` → \`src/*\`
- \`@assets/*\` → \`assets/*\`
`;
}

function generateCodeStyle(): string {
  return `## Code Style
- Use TypeScript with strict mode — no \`any\` types
- Use NativeWind className for styling (not StyleSheet.create)
- Use kebab-case for file names (e.g., \`my-component.tsx\`)
- Use PascalCase for component names
- Use path aliases (\`@/\`, \`@assets/\`) for imports — never relative paths like \`../../\`
- Functional components with hooks only — no class components
- Export components as named exports (not default)
`;
}

function generateComponentPatterns(): string {
  return `## Component Patterns
- Place reusable components in \`src/components/\`
- Place base/primitive UI components in \`src/components/ui/\`
- Place screen-specific components alongside their route files or in a \`_components/\` subfolder
- Export components as named exports
`;
}

function generateRouting(): string {
  return `## Routing
- All routes live in \`src/app/\` following expo-router conventions
- Use route groups \`(groupName)\` for layout organization
- Shared layouts use \`_layout.tsx\` files
`;
}

function generateGitWorkflow(): string {
  return `## Git Workflow
- Branch naming: \`ft/<feature-name>\`, \`fix/<bug-name>\`, \`refactor/<description>\`
- Commit messages: conventional commits (feat:, fix:, refactor:, docs:, chore:)
- Always create feature branches — never commit directly to \`main\`
- Run \`pnpm lint\` before committing
`;
}

function generateFeatureArchitecture(): string {
  return `## Feature Architecture
Each feature follows this pattern:
\`\`\`
src/features/<name>/
├── <name>-provider.tsx      # React context provider (with feature toggle)
├── create-<name>-service.ts # Factory with dynamic imports (if swappable providers)
├── no-op-<name>.ts          # Fallback when feature disabled
├── hooks/                   # Public hooks consumed by the app
├── providers/               # Swappable provider implementations
└── __tests__/               # Unit tests
\`\`\`
`;
}

function generateFeatureGuide(features: Record<string, string>): string {
  const sections = featureSections
    .filter((s) => s.featureKey in features)
    .map((s) => {
      const provider = features[s.featureKey];
      const lines = [`### ${s.title}`, ''];
      lines.push('**Key files:**');
      for (const f of s.files) {
        lines.push(`- \`${f}\``);
      }
      lines.push('');
      if (provider) {
        lines.push(`**Provider:** ${provider}`);
        lines.push('');
      }
      lines.push('**Patterns:**');
      for (const p of s.patterns) {
        lines.push(`- ${p}`);
      }
      return lines.join('\n');
    });

  return `## Feature Guide\n\n${sections.join('\n\n')}\n`;
}
```

- [ ] **Step 4: Run test — should PASS**

```bash
pnpm test -- setup/workflows/__tests__/generate-claude-md.test.ts --no-coverage
```

- [ ] **Step 5: Commit**

```bash
git add setup/workflows/generate-claude-md.ts setup/workflows/__tests__/generate-claude-md.test.ts
git commit -m "feat: add CLAUDE.md generator with manual/agentic modes"
```

---

## Task 3: Settings and Commands Generators

**Files:**
- Create: `setup/workflows/generate-settings.ts`
- Create: `setup/workflows/generate-commands.ts`
- Create: `setup/workflows/__tests__/generate-commands.test.ts`

- [ ] **Step 1: Create settings generator**

Create `setup/workflows/generate-settings.ts`:

```typescript
export function generateSettings(): object {
  return {
    permissions: {
      allow: [
        'Bash(pnpm lint)',
        'Bash(pnpm test)',
        'Bash(pnpm test:*)',
        'Bash(pnpm typecheck)',
        'Bash(pnpm start)',
        'Bash(pnpm start:*)',
        'Bash(git status*)',
        'Bash(git log*)',
        'Bash(git diff*)',
        'Bash(git branch*)',
        'Bash(git checkout*)',
        'Bash(git add*)',
        'Bash(git commit*)',
        'Bash(git push*)',
        'Bash(git pull*)',
        'Bash(git fetch*)',
        'Bash(gh issue*)',
        'Bash(gh pr*)',
      ],
    },
  };
}
```

- [ ] **Step 2: Write failing test for commands generator**

Create `setup/workflows/__tests__/generate-commands.test.ts`:

```typescript
import { getAvailableCommands } from '../generate-commands';
import { commands } from '../registry';

describe('getAvailableCommands', () => {
  const mockManifest = {
    features: {
      auth: { providers: { amplify: {} }, sharedFiles: [], sharedDependencies: {}, requires: [], enhancedBy: [], providerChain: null, routes: [], displayName: 'Auth', description: '', category: 'auth' },
      i18n: { providers: {}, sharedFiles: [], sharedDependencies: {}, requires: [], enhancedBy: [], providerChain: null, routes: [], displayName: 'i18n', description: '', category: 'i18n' },
    },
    categories: {},
  };

  it('should return all commands without conditions when features have providers', () => {
    const selected = { auth: 'amplify', i18n: '' };
    const selectedCommands = commands.map((c) => c.id);
    const result = getAvailableCommands(selectedCommands, selected, mockManifest as never);

    expect(result.map((c) => c.id)).toContain('add-provider');
    expect(result.map((c) => c.id)).toContain('add-feature');
  });

  it('should exclude add-provider when no features have providers', () => {
    const selected = { i18n: '' };
    const selectedCommands = commands.map((c) => c.id);
    const result = getAvailableCommands(selectedCommands, selected, mockManifest as never);

    expect(result.map((c) => c.id)).not.toContain('add-provider');
  });

  it('should only return user-selected commands', () => {
    const selected = { auth: 'amplify' };
    const selectedCommands = ['run-checks', 'evaluate'];
    const result = getAvailableCommands(selectedCommands, selected, mockManifest as never);

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(['run-checks', 'evaluate']);
  });
});
```

- [ ] **Step 3: Run test — should FAIL**

```bash
pnpm test -- setup/workflows/__tests__/generate-commands.test.ts --no-coverage
```

- [ ] **Step 4: Implement commands generator**

Create `setup/workflows/generate-commands.ts`:

```typescript
import { commands } from './registry';
import type { CommandDefinition } from './registry';
import type { Manifest } from '../generator';

export function getAvailableCommands(
  selectedCommandIds: string[],
  selectedFeatures: Record<string, string>,
  manifest: Manifest,
): CommandDefinition[] {
  return commands.filter((cmd) => {
    // Must be selected by the user
    if (!selectedCommandIds.includes(cmd.id)) return false;

    // Must pass condition check (if defined)
    if (cmd.condition && !cmd.condition(selectedFeatures, manifest)) return false;

    return true;
  });
}
```

- [ ] **Step 5: Run test — should PASS**

```bash
pnpm test -- setup/workflows/__tests__/generate-commands.test.ts --no-coverage
```

- [ ] **Step 6: Commit**

```bash
git add setup/workflows/generate-settings.ts setup/workflows/generate-commands.ts setup/workflows/__tests__/generate-commands.test.ts
git commit -m "feat: add settings and commands generators"
```

---

## Task 4: Command Templates

**Files:**
- Create: `setup/workflows/templates/commands/add-feature.md`
- Create: `setup/workflows/templates/commands/new-screen.md`
- Create: `setup/workflows/templates/commands/add-provider.md`
- Create: `setup/workflows/templates/commands/run-checks.md`
- Create: `setup/workflows/templates/commands/new-component.md`
- Create: `setup/workflows/templates/commands/create-issue.md`
- Create: `setup/workflows/templates/commands/create-branch.md`
- Create: `setup/workflows/templates/commands/evaluate.md`

- [ ] **Step 1: Create all 8 command templates**

Each template is a markdown file that Claude Code reads as a slash command prompt. Create each file with the full content as specified in the spec (Section 5). The templates should be self-contained instructions that Claude Code can follow.

For `/add-feature`:
```markdown
Create a new feature module following the Basekit pattern.

Ask the user for:
1. Feature name (kebab-case)
2. Does it need swappable providers? (Y/n)
3. Does it need a provider chain entry in app-providers.tsx? (Y/n)

Then scaffold these files:
- src/features/{name}/{name}-provider.tsx — React context provider
- src/features/{name}/hooks/use-{name}.ts — Public hook
- src/features/{name}/__tests__/ — Test directory
- src/features/{name}/index.ts — Barrel export

If providers needed, also create:
- src/features/{name}/create-{name}-service.ts — Factory with dynamic imports
- src/features/{name}/no-op-{name}.ts — No-op fallback
- src/features/{name}/providers/ — Provider directory
- src/services/{name}.interface.ts — Service contract
- src/types/{name}.types.ts — Types

If provider chain needed:
- Add the provider to src/lib/providers/app-providers.tsx
- Add feature config to src/config/basekit.config.ts

Follow TDD — write tests first, then implementation.
Use path aliases (@/) for all imports.
Use NativeWind className for any UI.
After scaffolding, run /evaluate to update CLAUDE.md.
```

For `/new-screen`:
```markdown
Create a new screen/route in the app.

Ask the user for:
1. Screen name (kebab-case)
2. Route group: (tabs), (auth), or root level
3. Does it need its own layout file? (Y/n)

Create the screen file at: src/app/{group}/{screen-name}.tsx

Use this pattern:
- Import ThemedView, ThemedText from @/components/
- Use NativeWind className for all styling
- Use path aliases for imports
- Export as default (required by expo-router)

If layout needed, also create: src/app/{group}/_layout.tsx
```

For `/add-provider`:
```markdown
Add a new provider implementation to an existing feature.

Ask the user for:
1. Which feature? (list features in src/features/ that have a providers/ directory)
2. Provider name (kebab-case)

Steps:
1. Read the service interface at src/services/{feature}.interface.ts
2. Create src/features/{feature}/providers/{provider}.ts implementing the full interface
3. Add the provider to the dynamic import map in create-{feature}-service.ts
4. Add the provider name to the union type in src/config/basekit.config.ts
5. Write unit tests for the new provider in src/features/{feature}/__tests__/
6. Run pnpm lint && pnpm typecheck && pnpm test
7. Run /evaluate to update CLAUDE.md with the new provider
```

For `/run-checks`:
```markdown
Run the full check suite and report results.

Execute in sequence:
1. pnpm lint
2. pnpm typecheck
3. pnpm test --no-coverage

Report pass/fail for each step. If any step fails, investigate the errors and suggest fixes before moving to the next step.
```

For `/new-component`:
```markdown
Create a new reusable component.

Ask the user for:
1. Component name (PascalCase)
2. Location: src/components/ui/ (base component) or src/components/ (shared component)

Create the file at: src/components/{ui/}{kebab-case-name}.tsx

Follow these patterns:
- Use NativeWind className for all styling
- Use useThemeColors() for dynamic theme values if needed
- Export as a named export (not default)
- Include a TypeScript props interface: {Name}Props
- Use path aliases (@/) for imports
```

For `/create-issue`:
```markdown
Create a GitHub issue for tracking work.

Ask the user for:
1. Issue title
2. Description
3. Labels: bug, feature, enhancement, docs (can select multiple)

Run:
```
gh issue create --title "{title}" --body "{description}" --label "{labels}"
```

If the `gh` CLI is not installed, format the issue as markdown output the user can copy-paste into GitHub's web UI.
```

For `/create-branch`:
```markdown
Create a feature branch following the project's naming convention.

Ask the user for:
1. Type: feature, fix, or refactor
2. Short description (will be converted to kebab-case)

Map type to prefix:
- feature → ft/
- fix → fix/
- refactor → refactor/

Run:
```
git checkout main
git pull origin main
git checkout -b {prefix}{description-in-kebab-case}
```
```

For `/evaluate` — this is the longest template because it embeds all generation rules:
```markdown
Scan the codebase and regenerate workflow files to match the current project state.

## What to scan

1. **Features:** List all directories in src/features/
2. **Providers:** For each feature, list files in src/features/{name}/providers/
3. **Config:** Read src/config/basekit.config.ts — extract enabled features and providers
4. **Components:** List all .tsx files in src/components/ and src/components/ui/
5. **Hooks:** List all .ts files in src/hooks/
6. **Routes:** List all route files in src/app/ (recursively, including route groups)
7. **Dependencies:** Read package.json — extract dependency names
8. **Scripts:** Read package.json scripts section
9. **Commands:** List existing .md files in .claude/commands/

## How to regenerate CLAUDE.md

Rewrite CLAUDE.md with these sections:

1. **Header:** `# {app name from basekit.config.ts}`
2. **Tech Stack:** List runtime, language, navigation, styling, and only technologies for features that exist in src/features/
3. **Project Structure:** Show actual src/ directory structure
4. **Commands:** List all pnpm scripts from package.json
5. **Path Aliases:** @/* → src/*, @assets/* → assets/*
6. **Code Style:** TypeScript strict, NativeWind className, kebab-case files, PascalCase components, path aliases, named exports
7. **Component Patterns:** src/components/, src/components/ui/, _components/ subfolders
8. **Routing:** expo-router conventions, route groups, _layout.tsx
9. **Git Workflow:** ft/, fix/, refactor/ branches, conventional commits
10. **Feature Architecture:** Show the standard feature module pattern
11. **Feature Guide:** For each feature directory that exists in src/features/, add a section with:
    - Key files (provider, hooks, service interface)
    - The active provider (from config or by checking which provider files exist)
    - Development patterns (how to extend, how to use hooks)

## How to manage commands

Check each command in .claude/commands/:
- If /add-provider.md exists but no feature has a providers/ directory → delete it
- If features with providers exist but /add-provider.md is missing → create it

Do NOT add or remove other commands — they are user-selected.

## After regenerating

1. Show a summary of what changed
2. Commit: `git add CLAUDE.md .claude/ && git commit -m "chore: update workflow files via /evaluate"`
```

- [ ] **Step 2: Commit all templates**

```bash
git add setup/workflows/templates/
git commit -m "feat: add all 8 slash command templates"
```

---

## Task 5: Setup Wizard Integration

**Files:**
- Modify: `setup/prompts.ts`
- Modify: `setup/index.ts`

- [ ] **Step 1: Update SetupAnswers and add workflow prompts**

Modify `setup/prompts.ts`:

Add to `SetupAnswers` interface:
```typescript
workflow: 'agentic' | 'manual';
agents: string[];
commands: string[];
```

Add workflow prompts after the dependency validation block in `runInteractivePrompts`, before the `return`:

```typescript
// Workflow mode
const workflow = await p.select({
  message: 'Development workflow',
  options: [
    { value: 'agentic', label: 'Agentic', hint: 'Generate AI agent workflow files' },
    { value: 'manual', label: 'Manual', hint: 'Minimal project context only' },
  ],
});

if (p.isCancel(workflow)) {
  p.cancel('Setup cancelled.');
  process.exit(0);
}

let agents: string[] = [];
let selectedCommands: string[] = [];

if (workflow === 'agentic') {
  const agentChoice = await p.multiselect({
    message: 'Select agents',
    options: [
      { value: 'claude-code', label: 'Claude Code', hint: 'CLAUDE.md + .claude/ commands' },
    ],
    required: true,
  });

  if (p.isCancel(agentChoice)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }
  agents = agentChoice as string[];

  if (agents.includes('claude-code')) {
    const { commands: availableCommands } = await import('./workflows/registry');
    const filteredCommands = availableCommands.filter(
      (cmd) => !cmd.condition || cmd.condition(features, manifest),
    );

    const commandChoice = await p.multiselect({
      message: 'Select workflow commands',
      options: filteredCommands.map((cmd) => ({
        value: cmd.id,
        label: cmd.name,
        hint: cmd.description,
      })),
      required: false,
    });

    if (p.isCancel(commandChoice)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }
    selectedCommands = commandChoice as string[];
  }
}
```

Update the return statement to include the new fields:
```typescript
return {
  // ...existing fields
  workflow: workflow as 'agentic' | 'manual',
  agents,
  commands: selectedCommands,
};
```

Update `getQuickDefaults()` to include:
```typescript
workflow: 'manual' as const,
agents: [],
commands: [],
```

- [ ] **Step 2: Add workflow generation step to setup/index.ts**

Add imports at the top of `setup/index.ts`:
```typescript
import { generateClaudeMd } from './workflows/generate-claude-md';
import { generateSettings } from './workflows/generate-settings';
import { getAvailableCommands } from './workflows/generate-commands';
```

Add the `--from` YAML parsing for workflow fields (in the `fromFile` branch, after setting `answers.features`):
```typescript
answers.workflow = config.workflow ?? 'manual';
answers.agents = config.agents ?? [];
answers.commands = config.commands ?? [];
```

Add workflow generation step between theme handling (current step 7) and pnpm install (current step 8). Insert this block:

```typescript
// Step 8: Generate workflow files
s.start('Generating workflow files');
const claudeMd = generateClaudeMd({
  appName: answers.appName,
  bundleId: answers.bundleId,
  scheme: answers.scheme,
  features: answers.features,
  workflow: answers.workflow,
});
await fs.writeFile(path.join(PROJECT_ROOT, 'CLAUDE.md'), claudeMd);

if (answers.workflow === 'agentic' && answers.agents.includes('claude-code')) {
  // Write settings.json
  await fs.ensureDir(path.join(PROJECT_ROOT, '.claude'));
  await fs.writeJson(
    path.join(PROJECT_ROOT, '.claude', 'settings.json'),
    generateSettings(),
    { spaces: 2 },
  );

  // Write selected command files
  const manifest: Manifest = await fs.readJson(path.join(PROJECT_ROOT, 'basekit.manifest.json')).catch(() => ({ features: {}, categories: {} }));
  const availableCommands = getAvailableCommands(answers.commands, answers.features, manifest);
  const commandsDir = path.join(PROJECT_ROOT, '.claude', 'commands');
  await fs.ensureDir(commandsDir);

  for (const cmd of availableCommands) {
    const templatePath = path.join(__dirname, 'workflows', 'templates', cmd.templateFile);
    if (await fs.pathExists(templatePath)) {
      const content = await fs.readFile(templatePath, 'utf-8');
      await fs.writeFile(path.join(commandsDir, `${cmd.id}.md`), content);
    }
  }
}
s.stop(color.green('Generated workflow files'));
```

Note: The manifest might already be deleted at this point in some code paths. Read it before it's stripped, or read it earlier in the flow and pass it through. Since the manifest is loaded at the top of `main()` and stored in `const manifest`, just use that variable directly.

- [ ] **Step 3: Update dry-run output to include workflow info**

In the dry-run block, add:
```typescript
`Workflow: ${answers.workflow}`,
`Agents: ${answers.agents.join(', ') || 'none'}`,
`Commands: ${answers.commands.join(', ') || 'none'}`,
```

- [ ] **Step 4: Run typecheck and all tests**

```bash
pnpm typecheck && pnpm test --no-coverage
```

Fix any issues.

- [ ] **Step 5: Commit**

```bash
git add setup/prompts.ts setup/index.ts
git commit -m "feat: integrate workflow generation into setup wizard"
```

---

## Task 6: Integration Test and Verification

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 3: Run all tests**

```bash
pnpm test --no-coverage
```

- [ ] **Step 4: Test dry-run with workflow**

```bash
pnpm run setup -- --dry-run --quick
```

Should show `Workflow: manual` in dry-run output.

- [ ] **Step 5: Final commit if fixes needed**

```bash
git add -A
git commit -m "fix: address integration issues"
```

---

## Summary

| Task | Description | Steps |
|------|-------------|-------|
| 1 | Registry (data definitions) | 2 |
| 2 | CLAUDE.md generator (TDD) | 5 |
| 3 | Settings + commands generators (TDD) | 6 |
| 4 | Command templates (8 files) | 2 |
| 5 | Setup wizard integration | 5 |
| 6 | Integration test | 5 |
| **Total** | | **25 steps** |
