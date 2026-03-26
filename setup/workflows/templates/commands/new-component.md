Create a new reusable component.

Ask the user for:
1. Component name (PascalCase)
2. Location: `src/components/ui/` (base component) or `src/components/` (shared component)

Create the file at: `src/components/{ui/}{kebab-case-name}.tsx`

Follow these patterns:
- Use NativeWind className for all styling
- Use `useThemeColors()` from `@/hooks/use-theme-colors` for dynamic theme values if needed
- Export as a named export (not default)
- Include a TypeScript props interface: `{Name}Props`
- Use path aliases (`@/`) for imports
