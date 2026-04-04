import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '../components/form-input';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof schema>;

function Wrapper({
  defaultValues,
  triggerErrors,
  children,
}: {
  defaultValues?: Partial<FormValues>;
  triggerErrors?: boolean;
  children: React.ReactNode;
}) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { email: '' },
  });

  React.useEffect(() => {
    if (triggerErrors) {
      void methods.trigger();
    }
  }, [triggerErrors, methods]);

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('FormInput', () => {
  it('renders with the label text', () => {
    render(
      <Wrapper>
        <FormInput name="email" label="Email Address" />
      </Wrapper>,
    );

    expect(screen.getByText('Email Address')).toBeTruthy();
  });

  it('shows error message when form has errors', async () => {
    render(
      <Wrapper defaultValues={{ email: 'not-an-email' }} triggerErrors>
        <FormInput name="email" label="Email" />
      </Wrapper>,
    );

    expect(await screen.findByText('Invalid email address')).toBeTruthy();
  });
});
