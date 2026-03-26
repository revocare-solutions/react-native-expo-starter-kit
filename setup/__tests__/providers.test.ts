import { generateAppProviders } from '../providers';

describe('generateAppProviders', () => {
  it('should generate provider chain with selected features', () => {
    const features = [
      { component: 'AuthProvider', importPath: '@/features/auth', order: 30 },
      { component: 'BasekitThemeProvider', importPath: '@/features/theme', order: 5 },
      { component: 'StorageProvider', importPath: '@/features/offline-storage', order: 20 },
    ];

    const result = generateAppProviders(features, true);

    // Should import all providers
    expect(result).toContain("import { AuthProvider } from '@/features/auth'");
    expect(result).toContain("import { BasekitThemeProvider } from '@/features/theme'");
    expect(result).toContain("import { StorageProvider } from '@/features/offline-storage'");

    // Should nest in order (lowest order = outermost)
    const themeIdx = result.indexOf('BasekitThemeProvider');
    const storageIdx = result.indexOf('StorageProvider');
    const authIdx = result.indexOf('AuthProvider');
    expect(themeIdx).toBeLessThan(storageIdx);
    expect(storageIdx).toBeLessThan(authIdx);
  });

  it('should generate minimal chain with no features', () => {
    const result = generateAppProviders([], false);

    expect(result).toContain('ThemeProvider');
    expect(result).toContain('QueryProvider');
    expect(result).not.toContain('AuthProvider');
    expect(result).not.toContain('configureAmplify');
  });

  it('should include Amplify config when needsAmplify is true', () => {
    const features = [
      { component: 'AuthProvider', importPath: '@/features/auth', order: 30 },
    ];

    const result = generateAppProviders(features, true);
    expect(result).toContain('configureAmplify');
  });

  it('should not include Amplify config when needsAmplify is false', () => {
    const features = [
      { component: 'AuthProvider', importPath: '@/features/auth', order: 30 },
    ];

    const result = generateAppProviders(features, false);
    expect(result).not.toContain('configureAmplify');
  });
});
