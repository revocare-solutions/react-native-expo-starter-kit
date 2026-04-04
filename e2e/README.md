# E2E Testing

Two testing strategies: **Maestro** for native device testing and **Playwright** for web browser testing.

## Maestro (Native)

Tests run on iOS Simulator or Android Emulator.

### Prerequisites

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Running

```bash
# Start app on simulator/emulator
pnpm start

# Run all Maestro tests
pnpm test:e2e

# Run a specific flow
maestro test e2e/.maestro/auth-login.yaml
```

### Flows

| Flow | Description |
| --- | --- |
| `app-launch.yaml` | App launches and Home screen is visible |
| `tab-navigation.yaml` | Switch between Home and Explore tabs |
| `auth-login.yaml` | Login with email/password |
| `auth-register.yaml` | Register and auto-login |
| `auth-forgot-password.yaml` | Navigate to forgot password and back |
| `explore-features.yaml` | Browse the Explore tab features |
| `full-flow.yaml` | Complete user journey: auth screens → login → navigation |

## Playwright (Web)

Tests run in a headless Chromium browser — no simulator required. Great for CI.

### Prerequisites

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

### Running

```bash
# Start Supabase (if auth tests need it)
pnpm supabase:up

# Run all Playwright tests (auto-starts web server)
pnpm test:e2e:web

# Run with UI mode
npx playwright test --config=e2e/playwright/playwright.config.ts --ui

# Run a specific test file
npx playwright test --config=e2e/playwright/playwright.config.ts e2e/playwright/auth.spec.ts
```

### Test Files

| File | Description |
| --- | --- |
| `auth.spec.ts` | Login, register, forgot password, invalid credentials |
| `navigation.spec.ts` | Tab navigation, home screen content |
| `error-boundary.spec.ts` | App recovery from errors |

## Writing New Tests

- **Maestro**: Add `.yaml` files to `e2e/.maestro/` — auto-discovered by `pnpm test:e2e`
- **Playwright**: Add `.spec.ts` files to `e2e/playwright/` — auto-discovered by `pnpm test:e2e:web`
