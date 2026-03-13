# Forms & Validation

## Overview

Type-safe form components with integrated validation powered by **React Hook Form** and **Zod**. Includes ready-to-use input, select, and checkbox components styled with NativeWind, plus common validation schemas for typical fields like email and password.

## Default Implementation

- [React Hook Form](https://react-hook-form.com/) -- performant form state management with minimal re-renders
- [Zod](https://zod.dev/) -- TypeScript-first schema validation
- [@hookform/resolvers](https://github.com/react-hook-form/resolvers) -- connects Zod schemas to React Hook Form

## Configuration

In `src/config/starter.config.ts`:

```ts
features: {
  forms: {
    enabled: true, // set false to disable Zod validation
  },
}
```

When `enabled: false`, `useAppForm` returns a plain `useForm` instance without a Zod resolver. Components continue to work but without schema-based validation.

## Usage

### Basic form with validation

```tsx
import { z } from 'zod';
import { FormProvider } from 'react-hook-form';
import { useAppForm, FormInput, emailSchema, passwordSchema } from '@/features/forms';

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const methods = useAppForm(loginSchema, {
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = methods.handleSubmit((data: LoginForm) => {
    console.log(data);
  });

  return (
    <FormProvider {...methods}>
      <FormInput name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
      <FormInput name="password" label="Password" secureTextEntry />
      <Pressable onPress={onSubmit}>
        <Text>Sign In</Text>
      </Pressable>
    </FormProvider>
  );
}
```

### Using FormSelect

```tsx
import { FormSelect } from '@/features/forms';

<FormSelect
  name="role"
  label="Role"
  options={[
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ]}
/>
```

### Using FormCheckbox

```tsx
import { FormCheckbox } from '@/features/forms';

<FormCheckbox name="acceptTerms" label="I accept the terms and conditions" />
```

### Common schemas

```ts
import { emailSchema, passwordSchema, requiredString } from '@/features/forms';

const schema = z.object({
  email: emailSchema,            // valid email
  password: passwordSchema,      // min 8 characters
  name: requiredString,          // non-empty string
});
```

## Components

| Component | Props | Description |
| --- | --- | --- |
| `FormInput` | `name`, `label`, + `TextInputProps` | Controlled text input with error display |
| `FormSelect` | `name`, `label`, `options` | Pressable dropdown with option list |
| `FormCheckbox` | `name`, `label` | Toggle checkbox with check indicator |

All components must be used inside a `<FormProvider>` from `react-hook-form`.

## Removing the Feature

**Option A** -- disable validation:

```ts
forms: { enabled: false },
```

`useAppForm` will skip the Zod resolver. Components still render but validation is not enforced.

**Option B** -- delete entirely:

1. Remove `src/features/forms/`.
2. Remove the `forms` key from `starter.config.ts`.
3. Remove any imports from `@/features/forms` in your code.
4. Uninstall dependencies: `pnpm remove react-hook-form zod @hookform/resolvers`.
