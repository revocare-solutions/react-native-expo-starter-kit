# E2E Testing with Maestro

This directory contains end-to-end test flows using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

Install the Maestro CLI:

```bash
# macOS / Linux
curl -Ls "https://get.maestro.mobile.dev" | bash
```

For Windows, see the [Maestro installation docs](https://maestro.mobile.dev/getting-started/installing-maestro).

## Running Tests

1. Start the dev server and run the app on a simulator/emulator:

   ```bash
   pnpm start
   ```

2. Run all E2E tests:

   ```bash
   pnpm test:e2e
   ```

   Or run a specific flow:

   ```bash
   maestro test e2e/.maestro/app-launch.yaml
   ```

## Test Flows

| Flow | Description |
| --- | --- |
| `app-launch.yaml` | Verifies the app launches and the Home screen is visible |
| `tab-navigation.yaml` | Verifies switching between Home and Explore tabs |

## Writing New Tests

Add new `.yaml` flow files to `e2e/.maestro/`. They will be picked up automatically when running `pnpm test:e2e`.

See the [Maestro docs](https://maestro.mobile.dev/) for the full flow file reference.
