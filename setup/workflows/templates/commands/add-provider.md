Add a new provider implementation to an existing feature.

Ask the user for:
1. Which feature? (list features in `src/features/` that have a `providers/` directory)
2. Provider name (kebab-case)

Steps:
1. Read the service interface at `src/services/{feature}.interface.ts`
2. Create `src/features/{feature}/providers/{provider}.ts` implementing the full interface
3. Add the provider to the dynamic import map in `create-{feature}-service.ts`
4. Add the provider name to the union type in `src/config/basekit.config.ts`
5. Write unit tests for the new provider in `src/features/{feature}/__tests__/`
6. Run `pnpm lint && pnpm typecheck && pnpm test`
7. Run `/evaluate` to update CLAUDE.md with the new provider
