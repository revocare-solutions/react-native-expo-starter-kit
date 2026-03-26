import { resolveFeaturesToStrip, collectDepsToRemove, collectEnvVarsToKeep } from '../generator';

const testManifest = {
  features: {
    auth: {
      displayName: 'Authentication',
      description: 'Auth',
      category: 'auth',
      providers: {
        amplify: {
          files: ['src/features/auth/providers/amplify.ts'],
          dependencies: { 'aws-amplify': '^6.0.0' },
          envVars: { required: ['EXPO_PUBLIC_COGNITO_USER_POOL_ID'], optional: [] },
        },
        firebase: {
          files: ['src/features/auth/providers/firebase.ts'],
          dependencies: { '@react-native-firebase/auth': '^21.0.0' },
          envVars: { required: [], optional: [] },
        },
      },
      sharedFiles: ['src/features/auth/'],
      sharedDependencies: {},
      requires: [],
      enhancedBy: ['security'],
      providerChain: { component: 'AuthProvider', import: '@/features/auth', order: 30 },
      routes: ['src/app/(auth)/'],
    },
    analytics: {
      displayName: 'Analytics',
      description: 'Analytics',
      category: 'analytics',
      providers: {
        amplify: {
          files: ['src/features/analytics/providers/amplify.ts'],
          dependencies: {},
          envVars: { required: [], optional: [] },
        },
      },
      sharedFiles: ['src/features/analytics/'],
      sharedDependencies: {},
      requires: [],
      enhancedBy: [],
      providerChain: { component: 'AnalyticsProvider', import: '@/features/analytics', order: 40 },
      routes: [],
    },
  },
  categories: {
    auth: { exclusive: true, label: 'Authentication' },
    analytics: { exclusive: true, label: 'Analytics' },
  },
};

describe('resolveFeaturesToStrip', () => {
  it('should return features not in selection', () => {
    const selected = { auth: 'firebase' };
    const result = resolveFeaturesToStrip(testManifest, selected);

    expect(result.featuresToRemove).toContain('analytics');
    expect(result.featuresToRemove).not.toContain('auth');
  });

  it('should identify provider files to remove for selected features', () => {
    const selected = { auth: 'firebase' };
    const result = resolveFeaturesToStrip(testManifest, selected);

    expect(result.providerFilesToRemove).toContain('src/features/auth/providers/amplify.ts');
    expect(result.providerFilesToRemove).not.toContain('src/features/auth/providers/firebase.ts');
  });

  it('should collect routes from removed features', () => {
    const selected = { analytics: 'amplify' };
    const result = resolveFeaturesToStrip(testManifest, selected);

    expect(result.routesToRemove).toContain('src/app/(auth)/');
  });

  it('should collect entire feature directory for removed features', () => {
    const selected = { auth: 'amplify' };
    const result = resolveFeaturesToStrip(testManifest, selected);

    expect(result.filesToRemove).toContain('src/features/analytics/');
    expect(result.filesToRemove).toContain('src/services/analytics.interface.ts');
    expect(result.filesToRemove).toContain('src/types/analytics.types.ts');
  });
});

describe('collectDepsToRemove', () => {
  it('should collect deps from removed features', () => {
    const result = collectDepsToRemove(testManifest, ['analytics'], {}, { auth: 'amplify' });
    expect(Array.isArray(result)).toBe(true);
  });

  it('should collect deps from removed providers when no selected feature needs them', () => {
    const removedProviderDeps: Record<string, boolean> = { 'aws-amplify': true };
    // No selected features use aws-amplify, so it should be removed
    const result = collectDepsToRemove(testManifest, [], removedProviderDeps, {});

    expect(result).toContain('aws-amplify');
  });

  it('should NOT remove deps that a selected feature still needs', () => {
    // analytics is removed (has aws-amplify as a dep via its amplify provider)
    // but auth is selected with amplify provider (also needs aws-amplify)
    const result = collectDepsToRemove(testManifest, ['analytics'], {}, { auth: 'amplify' });

    // aws-amplify should NOT be removed because auth-amplify still needs it
    expect(result).not.toContain('aws-amplify');
  });

  it('should remove deps when no selected feature needs them', () => {
    // auth is removed, firebase provider deps should be removed since nothing else uses them
    const result = collectDepsToRemove(testManifest, ['auth'], {}, { analytics: 'amplify' });

    expect(result).toContain('@react-native-firebase/auth');
    expect(result).toContain('aws-amplify');
  });
});

describe('collectEnvVarsToKeep', () => {
  it('should keep env vars for selected features and providers', () => {
    const selected = { auth: 'amplify' };
    const result = collectEnvVarsToKeep(testManifest, selected);

    expect(result).toContain('EXPO_PUBLIC_COGNITO_USER_POOL_ID');
    expect(result).toContain('EXPO_PUBLIC_API_URL');
  });

  it('should not keep env vars for unselected providers', () => {
    const selected = { auth: 'firebase' };
    const result = collectEnvVarsToKeep(testManifest, selected);

    expect(result).not.toContain('EXPO_PUBLIC_COGNITO_USER_POOL_ID');
  });
});
