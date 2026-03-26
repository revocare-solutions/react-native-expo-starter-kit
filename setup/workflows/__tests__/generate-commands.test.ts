import { getAvailableCommands } from '../generate-commands';
import { commands } from '../registry';

describe('getAvailableCommands', () => {
  const mockManifest = {
    features: {
      auth: { providers: { amplify: { files: [], dependencies: {}, envVars: { required: [], optional: [] } } }, sharedFiles: [], sharedDependencies: {}, requires: [], enhancedBy: [], providerChain: null, routes: [], displayName: 'Auth', description: '', category: 'auth' },
      i18n: { providers: {}, sharedFiles: [], sharedDependencies: {}, requires: [], enhancedBy: [], providerChain: null, routes: [], displayName: 'i18n', description: '', category: 'i18n' },
    },
    categories: {},
  };

  it('should include add-provider when features have providers', () => {
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
