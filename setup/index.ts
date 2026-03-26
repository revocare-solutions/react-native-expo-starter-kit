import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';
import * as p from '@clack/prompts';
import color from 'picocolors';
import YAML from 'yaml';
import { runInteractivePrompts, getQuickDefaults } from './prompts';
import type { SetupAnswers } from './prompts';
import { resolveFeaturesToStrip, collectDepsToRemove, collectEnvVarsToKeep } from './generator';
import type { Manifest } from './generator';
import { generateAppProviders } from './providers';
import { removeFeatureFiles, cleanPackageJson, updateEnvExample, updateAppJson } from './utils';

const PROJECT_ROOT = path.resolve(__dirname, '..');

function generateBasekitConfig(answers: SetupAnswers): string {
  const featureEntries = Object.entries(answers.features)
    .map(([name, provider]) => {
      const camelName = name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      if (provider) {
        return `    ${camelName}: { enabled: true, provider: '${provider}' },`;
      }
      return `    ${camelName}: { enabled: true },`;
    })
    .join('\n');

  return `export const basekitConfig = {
  app: {
    name: '${answers.appName}',
    bundleId: '${answers.bundleId}',
    scheme: '${answers.scheme}',
  },

  features: {
${featureEntries}
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },
};
`;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isQuick = args.includes('--quick');
  const fromIndex = args.indexOf('--from');
  const fromFile = fromIndex !== -1 ? args[fromIndex + 1] : null;

  // Load manifest
  const manifestPath = path.join(PROJECT_ROOT, 'basekit.manifest.json');
  if (!(await fs.pathExists(manifestPath))) {
    p.log.error('basekit.manifest.json not found. Has setup already been run?');
    process.exit(1);
  }
  const manifest: Manifest = await fs.readJson(manifestPath);

  // Get user choices
  let answers: SetupAnswers;

  if (isQuick) {
    answers = getQuickDefaults();
    p.intro(color.bgCyan(color.black(' Basekit — Quick Setup ')));
    p.log.info(`Theme: minimal | Backend: none | Features: offline-storage, i18n, forms`);
  } else if (fromFile) {
    const configContent = await fs.readFile(fromFile, 'utf-8');
    const config = YAML.parse(configContent);
    answers = {
      appName: config.app?.name ?? 'my-app',
      bundleId: config.app?.bundleId ?? 'com.mycompany.myapp',
      scheme: config.app?.scheme ?? 'myapp',
      theme: config.theme ?? null,
      backend: config.backend ?? null,
      features: {} as Record<string, string>,
    };
    for (const feat of config.features ?? []) {
      const feature = manifest.features[feat];
      if (!feature) {
        p.log.warn(`Unknown feature: ${feat} — skipping`);
        continue;
      }
      const providerNames = Object.keys(feature.providers);
      if (providerNames.length === 0) {
        answers.features[feat] = '';
      } else if (config.backend && providerNames.includes(config.backend)) {
        answers.features[feat] = config.backend;
      } else {
        answers.features[feat] = providerNames[0];
      }
    }
    if (answers.theme) {
      answers.features['theme'] = answers.theme;
    }
    p.intro(color.bgCyan(color.black(` Basekit — Config: ${fromFile} `)));
  } else {
    answers = await runInteractivePrompts(manifest);
  }

  // Resolve what to strip
  const stripResult = resolveFeaturesToStrip(manifest, answers.features);

  // Collect provider deps to remove
  const removedProviderDeps: Record<string, boolean> = {};
  for (const featureName of Object.keys(answers.features)) {
    const feature = manifest.features[featureName];
    if (!feature) continue;
    const selectedProvider = answers.features[featureName];
    for (const [provName, prov] of Object.entries(feature.providers)) {
      if (provName !== selectedProvider) {
        for (const dep of Object.keys(prov.dependencies)) {
          removedProviderDeps[dep] = true;
        }
      }
    }
  }

  const depsToRemove = collectDepsToRemove(manifest, stripResult.featuresToRemove, removedProviderDeps);
  const envVarsToKeep = collectEnvVarsToKeep(manifest, answers.features);

  // Dry run
  if (isDryRun) {
    p.note(
      [
        `App: ${answers.appName} (${answers.bundleId})`,
        `Theme: ${answers.theme ?? 'none'}`,
        `Features kept: ${Object.keys(answers.features).join(', ') || 'none'}`,
        `Features to remove: ${stripResult.featuresToRemove.join(', ') || 'none'}`,
        `Provider files to remove: ${stripResult.providerFilesToRemove.length}`,
        `Routes to remove: ${stripResult.routesToRemove.join(', ') || 'none'}`,
        `Dependencies to remove: ${depsToRemove.length}`,
        `Env vars to keep: ${envVarsToKeep.join(', ')}`,
      ].join('\n'),
      'Dry Run Summary',
    );
    p.outro('No files were modified.');
    return;
  }

  // Determine if Amplify is needed
  const needsAmplify = Object.values(answers.features).some((prov) => prov === 'amplify');

  // Build provider chain entries
  const providerChainEntries = Object.keys(answers.features)
    .map((featureName) => manifest.features[featureName]?.providerChain)
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .map((entry) => ({
      component: entry.component,
      importPath: entry.import,
      order: entry.order,
    }));

  const s = p.spinner();

  // Step 1: Update app.json
  s.start('Updating app.json');
  await updateAppJson(PROJECT_ROOT, answers.appName, answers.bundleId, answers.scheme);
  s.stop(color.green('Updated app.json'));

  // Step 2: Strip feature files
  s.start('Removing unselected features');
  const allFilesToRemove = [
    ...stripResult.filesToRemove,
    ...stripResult.providerFilesToRemove,
    ...stripResult.routesToRemove,
  ];
  await removeFeatureFiles(PROJECT_ROOT, allFilesToRemove);
  s.stop(color.green(`Removed ${stripResult.featuresToRemove.length} features`));

  // Step 3: Rewrite app-providers.tsx
  s.start('Rewriting app-providers.tsx');
  const providersContent = generateAppProviders(providerChainEntries, needsAmplify);
  await fs.writeFile(path.join(PROJECT_ROOT, 'src/lib/providers/app-providers.tsx'), providersContent);
  s.stop(color.green('Rewrote app-providers.tsx'));

  // Step 4: Rewrite config
  s.start('Updating config');
  const configContent = generateBasekitConfig(answers);
  await fs.writeFile(path.join(PROJECT_ROOT, 'src/config/basekit.config.ts'), configContent);
  s.stop(color.green('Updated config'));

  // Step 5: Clean package.json
  s.start('Cleaning package.json');
  const setupDevDeps = ['@clack/prompts', 'fs-extra', '@types/fs-extra', 'yaml', 'execa', 'picocolors', 'tsx', 'jiti'];
  const pkgPath = path.join(PROJECT_ROOT, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  const cleanedPkg = cleanPackageJson(pkg, depsToRemove, setupDevDeps);
  if (cleanedPkg.scripts && typeof cleanedPkg.scripts === 'object') {
    delete (cleanedPkg.scripts as Record<string, string>)['setup'];
  }
  await fs.writeJson(pkgPath, cleanedPkg, { spaces: 2 });
  s.stop(color.green(`Cleaned package.json (removed ${depsToRemove.length} deps)`));

  // Step 6: Update .env.example
  s.start('Updating .env.example');
  const envPath = path.join(PROJECT_ROOT, '.env.example');
  if (await fs.pathExists(envPath)) {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const updatedEnv = updateEnvExample(envContent, envVarsToKeep);
    await fs.writeFile(envPath, updatedEnv);
  }
  s.stop(color.green('Updated .env.example'));

  // Step 7: Handle theme
  if (!answers.theme) {
    s.start('Removing theme feature');
    await removeFeatureFiles(PROJECT_ROOT, ['src/features/theme/', 'src/config/theme.config.ts']);
    const basicTailwind = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ["./src/**/*.{js,jsx,ts,tsx}"],\n  presets: [require("nativewind/preset")],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};\n`;
    await fs.writeFile(path.join(PROJECT_ROOT, 'tailwind.config.js'), basicTailwind);
    s.stop(color.green('Removed theme feature'));
  }

  // Step 8: pnpm install
  s.start('Installing dependencies');
  await execa('pnpm', ['install'], { cwd: PROJECT_ROOT });
  s.stop(color.green('Installed dependencies'));

  // Step 9: Self-destruct
  s.start('Cleaning up setup files');
  await removeFeatureFiles(PROJECT_ROOT, ['setup/', 'basekit.manifest.json']);
  s.stop(color.green('Removed setup files'));

  // Step 10: Git commit
  s.start('Creating initial commit');
  try {
    await execa('git', ['add', '-A'], { cwd: PROJECT_ROOT });
    await execa('git', ['commit', '-m', 'Initial project setup via Basekit'], { cwd: PROJECT_ROOT });
    s.stop(color.green('Created initial commit'));
  } catch {
    s.stop(color.yellow('Skipped git commit (not a git repo or no changes)'));
  }

  p.outro(color.green('Done! Run: pnpm start'));
}

main().catch((err) => {
  p.log.error(`Setup failed: ${err instanceof Error ? err.message : String(err)}`);
  p.log.info('To recover: git checkout . && git clean -fd && pnpm install');
  process.exit(1);
});
