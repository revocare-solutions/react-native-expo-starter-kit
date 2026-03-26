Create a new feature module following the Basekit pattern.

Ask the user for:
1. Feature name (kebab-case)
2. Does it need swappable providers? (Y/n)
3. Does it need a provider chain entry in app-providers.tsx? (Y/n)

Then scaffold these files:
- `src/features/{name}/{name}-provider.tsx` — React context provider
- `src/features/{name}/hooks/use-{name}.ts` — Public hook
- `src/features/{name}/__tests__/` — Test directory
- `src/features/{name}/index.ts` — Barrel export

If providers needed, also create:
- `src/features/{name}/create-{name}-service.ts` — Factory with dynamic imports
- `src/features/{name}/no-op-{name}.ts` — No-op fallback
- `src/features/{name}/providers/` — Provider directory
- `src/services/{name}.interface.ts` — Service contract
- `src/types/{name}.types.ts` — Types

If provider chain needed:
- Add the provider to `src/lib/providers/app-providers.tsx`
- Add feature config to `src/config/basekit.config.ts`

Follow TDD — write tests first, then implementation.
Use path aliases (`@/`) for all imports.
Use NativeWind className for any UI.
After scaffolding, run `/evaluate` to update CLAUDE.md.
