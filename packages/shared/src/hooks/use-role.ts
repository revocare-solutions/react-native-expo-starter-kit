import { useAuth } from '@/features/auth';

export type ClientRole = 'customer' | 'premium';
export type AdminRole = 'support' | 'admin' | 'super_admin';
export type AppRole = ClientRole | AdminRole;

export function useRole(): AppRole {
  const { user } = useAuth();
  return (user?.attributes?.role as AppRole) ?? 'customer';
}

export function useHasRole(requiredRole: AppRole | AppRole[]): boolean {
  const role = useRole();
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(role);
  }
  return role === requiredRole;
}
