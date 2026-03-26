Create a new screen/route in the app.

Ask the user for:
1. Screen name (kebab-case)
2. Route group: `(tabs)`, `(auth)`, or root level
3. Does it need its own layout file? (Y/n)

Create the screen file at: `src/app/{group}/{screen-name}.tsx`

Use this pattern:
- Import `ThemedView`, `ThemedText` from `@/components/`
- Use NativeWind className for all styling
- Use path aliases for imports
- Export as default (required by expo-router)

If layout needed, also create: `src/app/{group}/_layout.tsx`
