import type { PinningConfig } from '@/types';

export const pinningConfig: PinningConfig = {
  enabled: false,
  pins: [
    // Add your SSL pins here:
    // { hostname: 'api.myapp.com', sha256: ['AAAA...='] },
  ],
  environment: {
    development: false,
    staging: true,
    production: true,
  },
};
