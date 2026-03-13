import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';
import { starterConfig } from '@/config/starter.config';

export function useAppForm<T extends FieldValues>(
  schema: ZodSchema<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>,
) {
  if (!starterConfig.features.forms.enabled) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useForm<T>(options);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useForm<T>({
    resolver: zodResolver(schema),
    ...options,
  });
}
