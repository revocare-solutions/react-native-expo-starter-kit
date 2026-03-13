import { starterConfig } from '@/config/starter.config';

export function buildDeepLink(path: string): string {
  const scheme = starterConfig.app.scheme;
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${scheme}://${cleanPath}`;
}
