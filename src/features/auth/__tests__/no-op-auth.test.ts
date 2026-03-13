import { noOpAuth } from '../no-op-auth';

describe('noOpAuth', () => {
  it('signIn returns { success: false }', async () => {
    const result = await noOpAuth.signIn('test@example.com', 'password');
    expect(result).toEqual({ success: false });
  });

  it('signUp returns { success: false }', async () => {
    const result = await noOpAuth.signUp('test@example.com', 'password');
    expect(result).toEqual({ success: false });
  });

  it('signOut does not throw', async () => {
    await expect(noOpAuth.signOut()).resolves.toBeUndefined();
  });

  it('resetPassword does not throw', async () => {
    await expect(noOpAuth.resetPassword('test@example.com')).resolves.toBeUndefined();
  });

  it('confirmResetPassword does not throw', async () => {
    await expect(
      noOpAuth.confirmResetPassword('test@example.com', '123456', 'newpass'),
    ).resolves.toBeUndefined();
  });

  it('getCurrentUser returns null', async () => {
    const user = await noOpAuth.getCurrentUser();
    expect(user).toBeNull();
  });

  it('getSession returns null', async () => {
    const session = await noOpAuth.getSession();
    expect(session).toBeNull();
  });

  it('onAuthStateChange returns an unsubscribe function', () => {
    const unsubscribe = noOpAuth.onAuthStateChange(() => {});
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });
});
