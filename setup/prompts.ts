import * as p from '@clack/prompts';
import color from 'picocolors';
import type { Manifest } from './generator';

export interface SetupAnswers {
  appName: string;
  bundleId: string;
  scheme: string;
  theme: string | null;
  backend: string | null;
  features: Record<string, string>;
  workflow: 'agentic' | 'manual';
  agents: string[];
  commands: string[];
}

export function validateDependencies(
  manifest: Manifest,
  selected: Record<string, string>,
): { valid: boolean; missing: Array<{ feature: string; requires: string }> } {
  const missing: Array<{ feature: string; requires: string }> = [];

  for (const featureName of Object.keys(selected)) {
    const feature = manifest.features[featureName];
    if (!feature) continue;
    for (const req of feature.requires) {
      if (!(req in selected)) {
        missing.push({ feature: featureName, requires: req });
      }
    }
  }

  return { valid: missing.length === 0, missing };
}

export async function runInteractivePrompts(manifest: Manifest): Promise<SetupAnswers> {
  p.intro(color.bgCyan(color.black(" Welcome to Basekit! Let's configure your app. ")));

  const appInfo = await p.group({
    appName: () =>
      p.text({
        message: 'App name',
        placeholder: 'my-app',
        validate: (v) => (!v || v.length === 0 ? 'App name is required' : undefined),
      }),
    bundleId: () =>
      p.text({
        message: 'Bundle ID',
        placeholder: 'com.mycompany.myapp',
        validate: (v) => (!v || v.length === 0 ? 'Bundle ID is required' : undefined),
      }),
    scheme: () =>
      p.text({
        message: 'URL scheme (for deep linking)',
        placeholder: 'myapp',
        validate: (v) => (!v || v.length === 0 ? 'Scheme is required' : undefined),
      }),
  });

  if (p.isCancel(appInfo)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const theme = await p.select({
    message: 'Choose a theme preset',
    options: [
      { value: 'minimal', label: 'Minimal', hint: 'Clean, subtle, lots of white space' },
      { value: 'bold', label: 'Bold', hint: 'Vibrant, high contrast, startup feel' },
      { value: 'corporate', label: 'Corporate', hint: 'Professional, muted, enterprise-safe' },
      { value: 'none', label: 'None', hint: 'Use basic theme constants' },
    ],
  });

  if (p.isCancel(theme)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const backend = await p.select({
    message: 'Choose a backend provider',
    options: [
      { value: 'none', label: 'None', hint: "I'll add one later" },
      { value: 'amplify', label: 'AWS Amplify', hint: 'Cognito, Analytics, Push' },
      { value: 'firebase', label: 'Firebase', hint: 'Auth, Firestore, Crashlytics, FCM' },
      { value: 'supabase', label: 'Supabase', hint: 'Auth, Postgres, Realtime' },
      { value: 'custom', label: 'Custom', hint: 'REST/GraphQL with JWT auth' },
    ],
  });

  if (p.isCancel(backend)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Build feature options from manifest (exclude theme — handled separately)
  const featureOptions = Object.entries(manifest.features)
    .filter(([name]) => name !== 'theme')
    .map(([name, feature]) => ({
      value: name,
      label: feature.displayName,
      hint: feature.description,
    }));

  const selectedFeatureNames = await p.multiselect({
    message: 'Select features (space to toggle)',
    options: featureOptions,
    required: false,
  });

  if (p.isCancel(selectedFeatureNames)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Map selected features to their provider (based on backend choice)
  const features: Record<string, string> = {};
  for (const name of selectedFeatureNames as string[]) {
    const feature = manifest.features[name];
    const providerNames = Object.keys(feature.providers);

    if (providerNames.length === 0) {
      features[name] = '';
    } else if (providerNames.length === 1) {
      features[name] = providerNames[0];
    } else if (backend !== 'none' && providerNames.includes(backend as string)) {
      features[name] = backend as string;
    } else {
      const providerChoice = await p.select({
        message: `Choose provider for ${feature.displayName}`,
        options: providerNames.map((pn) => ({ value: pn, label: pn })),
      });
      if (p.isCancel(providerChoice)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }
      features[name] = providerChoice as string;
    }
  }

  // Add theme if selected
  if (theme !== 'none') {
    features['theme'] = theme as string;
  }

  // Validate dependencies
  const { missing } = validateDependencies(manifest, features);
  for (const { feature, requires } of missing) {
    const reqFeature = manifest.features[requires];
    const addIt = await p.confirm({
      message: `${manifest.features[feature].displayName} requires ${reqFeature?.displayName ?? requires}. Add it?`,
    });

    if (p.isCancel(addIt)) {
      p.cancel('Setup cancelled.');
      process.exit(0);
    }

    if (addIt) {
      const reqProviders = Object.keys(reqFeature?.providers ?? {});
      if (reqProviders.length === 0) {
        features[requires] = '';
      } else if (backend !== 'none' && reqProviders.includes(backend as string)) {
        features[requires] = backend as string;
      } else {
        features[requires] = reqProviders[0];
      }
    } else {
      delete features[feature];
      p.log.warn(`Removed ${manifest.features[feature].displayName} (missing dependency)`);
    }
  }

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
      const { commands: registryCommands } = await import('./workflows/registry');
      const filteredCommands = registryCommands.filter(
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

  return {
    appName: appInfo.appName,
    bundleId: appInfo.bundleId,
    scheme: appInfo.scheme,
    theme: theme === 'none' ? null : (theme as string),
    backend: backend === 'none' ? null : (backend as string),
    features,
    workflow: workflow as 'agentic' | 'manual',
    agents,
    commands: selectedCommands,
  };
}

export function getQuickDefaults(): SetupAnswers {
  return {
    appName: 'my-app',
    bundleId: 'com.mycompany.myapp',
    scheme: 'myapp',
    theme: 'minimal',
    backend: null,
    features: {
      'offline-storage': 'mmkv',
      i18n: '',
      forms: '',
      theme: 'minimal',
    },
    workflow: 'manual' as const,
    agents: [],
    commands: [],
  };
}
