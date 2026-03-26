import { generateClaudeMd } from '../generate-claude-md';

describe('generateClaudeMd', () => {
  const baseAnswers = {
    appName: 'test-app',
    bundleId: 'com.test.app',
    scheme: 'testapp',
    features: { auth: 'amplify', i18n: '', theme: 'minimal' } as Record<string, string>,
  };

  it('should generate minimal CLAUDE.md for manual mode', () => {
    const result = generateClaudeMd({ ...baseAnswers, workflow: 'manual' as const });

    expect(result).toContain('# test-app');
    expect(result).toContain('## Tech Stack');
    expect(result).toContain('## Commands');
    expect(result).not.toContain('## Code Style');
    expect(result).not.toContain('## Feature Guide');
  });

  it('should generate full CLAUDE.md for agentic mode', () => {
    const result = generateClaudeMd({ ...baseAnswers, workflow: 'agentic' as const });

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
    const result = generateClaudeMd({ ...baseAnswers, workflow: 'agentic' as const });

    expect(result).toContain('amplify');
    expect(result).toContain('src/services/auth.interface.ts');
  });

  it('should include tech stack entries for selected features', () => {
    const result = generateClaudeMd({ ...baseAnswers, workflow: 'manual' as const });

    expect(result).toContain('i18next');
    expect(result).toContain('Theming');
    expect(result).not.toContain('Forms');
  });
});
