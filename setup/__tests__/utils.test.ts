import { removeFeatureFiles, cleanPackageJson, updateEnvExample } from '../utils';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('removeFeatureFiles', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'basekit-test-'));
    await fs.ensureDir(path.join(tmpDir, 'src/features/auth/providers'));
    await fs.writeFile(path.join(tmpDir, 'src/features/auth/index.ts'), 'export {}');
    await fs.ensureDir(path.join(tmpDir, 'src/features/analytics'));
    await fs.writeFile(path.join(tmpDir, 'src/features/analytics/index.ts'), 'export {}');
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('should delete feature directory', async () => {
    await removeFeatureFiles(tmpDir, ['src/features/analytics/']);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/analytics'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/auth'))).toBe(true);
  });

  it('should delete specific files', async () => {
    await removeFeatureFiles(tmpDir, ['src/features/auth/index.ts']);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/auth/index.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/auth/providers'))).toBe(true);
  });
});

describe('cleanPackageJson', () => {
  it('should remove specified dependencies', () => {
    const pkg = {
      dependencies: { react: '19.0.0', 'aws-amplify': '^6.0.0', axios: '^1.0.0' },
      devDependencies: { typescript: '^5.0.0', '@clack/prompts': '^0.1.0' },
    };
    const result = cleanPackageJson(pkg, ['aws-amplify'], ['@clack/prompts']);
    expect(result.dependencies['aws-amplify']).toBeUndefined();
    expect(result.dependencies['react']).toBe('19.0.0');
    expect(result.devDependencies['@clack/prompts']).toBeUndefined();
    expect(result.devDependencies['typescript']).toBe('^5.0.0');
  });
});

describe('updateEnvExample', () => {
  it('should keep only specified env vars and their comments', () => {
    const content = `# API
EXPO_PUBLIC_API_URL=https://api.example.com

# Auth - AWS Amplify
EXPO_PUBLIC_COGNITO_USER_POOL_ID=
EXPO_PUBLIC_COGNITO_CLIENT_ID=

# Auth - Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
`;
    const result = updateEnvExample(content, [
      'EXPO_PUBLIC_API_URL',
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ]);
    expect(result).toContain('EXPO_PUBLIC_API_URL');
    expect(result).toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(result).not.toContain('COGNITO');
  });
});
