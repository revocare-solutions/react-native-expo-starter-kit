interface ProviderEntry {
  component: string;
  importPath: string;
  order: number;
}

export function generateAppProviders(features: ProviderEntry[], needsAmplify: boolean): string {
  const sorted = [...features].sort((a, b) => a.order - b.order);

  const imports: string[] = [
    "import React, { useEffect } from 'react';",
    "import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';",
    "import { QueryProvider } from '@/lib/api';",
    "import { useColorScheme } from '@/hooks/use-color-scheme';",
  ];

  if (needsAmplify) {
    imports.push("import { configureAmplify } from '@/lib/amplify/configure';");
  }

  for (const entry of sorted) {
    imports.push(`import { ${entry.component} } from '${entry.importPath}';`);
  }

  // Build nested JSX — innermost is {children}, wrap outward by reverse order
  let inner = '            {children}';

  for (const entry of [...sorted].reverse()) {
    inner = `            <${entry.component}>\n${inner}\n            </${entry.component}>`;
  }

  const amplifyEffect = needsAmplify
    ? `\n  useEffect(() => {\n    configureAmplify();\n  }, []);\n`
    : '';

  return `${imports.join('\n')}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
${amplifyEffect}
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryProvider>
${inner}
      </QueryProvider>
    </ThemeProvider>
  );
}
`;
}
