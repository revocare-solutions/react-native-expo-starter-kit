interface ManifestProvider {
  files: string[];
  dependencies: Record<string, string>;
  envVars: { required: string[]; optional: string[] };
}

interface ManifestFeature {
  displayName: string;
  description: string;
  category: string;
  providers: Record<string, ManifestProvider>;
  sharedFiles: string[];
  sharedDependencies: Record<string, string>;
  requires: string[];
  enhancedBy: string[];
  providerChain: { component: string; import: string; order: number } | null;
  routes: string[];
}

export interface Manifest {
  features: Record<string, ManifestFeature>;
  categories: Record<string, { exclusive: boolean; label: string }>;
}

interface StripResult {
  featuresToRemove: string[];
  providerFilesToRemove: string[];
  routesToRemove: string[];
  filesToRemove: string[];
}

export function resolveFeaturesToStrip(
  manifest: Manifest,
  selectedFeatures: Record<string, string>,
): StripResult {
  const featuresToRemove: string[] = [];
  const providerFilesToRemove: string[] = [];
  const routesToRemove: string[] = [];
  const filesToRemove: string[] = [];

  for (const [featureName, feature] of Object.entries(manifest.features)) {
    if (!(featureName in selectedFeatures)) {
      featuresToRemove.push(featureName);
      filesToRemove.push(...feature.sharedFiles);
      routesToRemove.push(...feature.routes);
      for (const provider of Object.values(feature.providers)) {
        filesToRemove.push(...provider.files);
      }
    } else {
      const selectedProvider = selectedFeatures[featureName];
      for (const [providerName, provider] of Object.entries(feature.providers)) {
        if (providerName !== selectedProvider) {
          providerFilesToRemove.push(...provider.files);
        }
      }
    }
  }

  return { featuresToRemove, providerFilesToRemove, routesToRemove, filesToRemove };
}

export function collectDepsToRemove(
  manifest: Manifest,
  removedFeatures: string[],
  removedProviderDeps: Record<string, boolean>,
): string[] {
  const depsToRemove: string[] = [];

  for (const featureName of removedFeatures) {
    const feature = manifest.features[featureName];
    if (!feature) continue;
    depsToRemove.push(...Object.keys(feature.sharedDependencies));
    for (const provider of Object.values(feature.providers)) {
      depsToRemove.push(...Object.keys(provider.dependencies));
    }
  }

  depsToRemove.push(...Object.keys(removedProviderDeps));

  return [...new Set(depsToRemove)];
}

export function collectEnvVarsToKeep(
  manifest: Manifest,
  selectedFeatures: Record<string, string>,
): string[] {
  const envVars: string[] = ['EXPO_PUBLIC_API_URL'];

  for (const [featureName, selectedProvider] of Object.entries(selectedFeatures)) {
    const feature = manifest.features[featureName];
    if (!feature) continue;

    const provider = feature.providers[selectedProvider];
    if (provider) {
      envVars.push(...provider.envVars.required, ...provider.envVars.optional);
    }
  }

  return [...new Set(envVars)];
}
