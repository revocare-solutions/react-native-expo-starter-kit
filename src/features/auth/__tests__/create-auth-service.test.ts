import { noOpAuth } from '../no-op-auth';

describe('createAuthService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns noOpAuth when feature is disabled', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          auth: { enabled: false, provider: 'amplify' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAuthService } = require('../create-auth-service') as {
      createAuthService: () => Promise<typeof noOpAuth>;
    };
    const service = await createAuthService();

    const result = await service.signIn('test@example.com', 'password');
    expect(result).toEqual({ success: false });

    const user = await service.getCurrentUser();
    expect(user).toBeNull();

    const session = await service.getSession();
    expect(session).toBeNull();
  });

  it('falls back to noOpAuth for unknown provider', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          auth: { enabled: true, provider: 'unknown-provider' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAuthService } = require('../create-auth-service') as {
      createAuthService: () => Promise<typeof noOpAuth>;
    };
    const service = await createAuthService();

    const result = await service.signIn('test@example.com', 'password');
    expect(result).toEqual({ success: false });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown auth provider'),
    );

    warnSpy.mockRestore();
  });
});
