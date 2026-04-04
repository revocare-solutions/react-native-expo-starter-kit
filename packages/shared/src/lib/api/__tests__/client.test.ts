const mockCreate = jest.fn().mockReturnValue({
  defaults: {
    baseURL: 'https://api.test.com',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
  },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
});

jest.mock('axios', () => ({
  __esModule: true,
  default: { create: mockCreate },
}));

jest.mock('@/config/basekit.config', () => ({
  basekitConfig: {
    api: { baseUrl: 'https://api.test.com', timeout: 5000 },
  },
}));

describe('apiClient', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('creates axios instance with correct config', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../client');

    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: 'https://api.test.com',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('exports apiClient from axios.create', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { apiClient } = require('../client') as { apiClient: { defaults: { baseURL: string; timeout: number; headers: Record<string, string> } } };

    expect(apiClient.defaults.baseURL).toBe('https://api.test.com');
    expect(apiClient.defaults.timeout).toBe(5000);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('exports setAuthTokenGetter function', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { setAuthTokenGetter } = require('../client') as { setAuthTokenGetter: (getter: () => Promise<string | null>) => void };

    expect(typeof setAuthTokenGetter).toBe('function');
  });
});
