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

  sections.push(`# ${appName}\n`);
  sections.push(generateTechStack(features));
  sections.push(generateProjectStructure(features));
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
  const featureKeys = Object.keys(features).filter((f) => f !== 'theme');
  const featureDirs = featureKeys.map((f) => `│   ├── ${f}/`).join('\n');
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
