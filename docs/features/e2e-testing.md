# E2E Testing with Maestro

## Overview

This project uses [Maestro](https://maestro.mobile.dev/) for end-to-end (E2E) mobile UI testing. Maestro is a declarative, YAML-based testing framework designed specifically for mobile apps.

### Why Maestro?

- **Simple YAML syntax** -- no JavaScript test code to maintain
- **Built for mobile** -- handles flakiness, animations, and async rendering automatically
- **Fast to write** -- a new test flow can be added in minutes
- **No npm dependency** -- Maestro is a standalone CLI tool, keeping the project dependency tree clean
- **CI-ready** -- integrates with Maestro Cloud for cloud-based test execution

## Installation

Maestro is installed as a system-level CLI tool, not as an npm package.

### macOS / Linux

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Windows

Maestro on Windows requires WSL 2. Follow the [official installation guide](https://maestro.mobile.dev/getting-started/installing-maestro) for detailed steps.

### Verify Installation

```bash
maestro --version
```

## Running Tests

### Run All Flows

```bash
pnpm test:e2e
```

This executes `maestro test e2e/.maestro/`, which runs every `.yaml` flow file in the directory.

### Run a Single Flow

```bash
maestro test e2e/.maestro/app-launch.yaml
```

### Prerequisites

Before running E2E tests, you need a running app instance:

1. Start an iOS Simulator or Android Emulator.
2. Build and launch the app:
   ```bash
   pnpm start
   ```
3. Run the tests in a separate terminal.

## Writing New Test Flows

### File Location

All flow files live in `e2e/.maestro/`. Add new `.yaml` files there and they will be included automatically.

### Flow File Syntax

Every flow file starts with a front-matter block specifying the `appId`, followed by a `---` separator and a list of commands:

```yaml
appId: com.mycompany.myapp
---
- launchApp
- assertVisible: "Some Text"
- tapOn: "Button Label"
```

### Common Commands

| Command | Description |
| --- | --- |
| `launchApp` | Launch (or re-launch) the app |
| `assertVisible: "text"` | Assert that text is visible on screen |
| `assertNotVisible: "text"` | Assert that text is not visible |
| `tapOn: "text"` | Tap on an element containing the text |
| `inputText: "value"` | Type text into the focused input |
| `scrollUntilVisible` | Scroll until an element becomes visible |
| `back` | Press the system back button (Android) |
| `waitForAnimationToEnd` | Wait for animations to settle |

For the full command reference, see the [Maestro documentation](https://maestro.mobile.dev/).

### Example: Testing a Form

```yaml
appId: com.mycompany.myapp
---
- launchApp
- tapOn: "Login"
- tapOn: "Email"
- inputText: "user@example.com"
- tapOn: "Password"
- inputText: "secret123"
- tapOn: "Submit"
- assertVisible: "Welcome"
```

## CI Integration

### Maestro Cloud

Maestro offers a cloud service for running tests in CI without managing emulators:

```bash
maestro cloud --app-file=path/to/app.apk e2e/.maestro/
```

This can be integrated into GitHub Actions or any CI pipeline. See the [Maestro Cloud docs](https://cloud.mobile.dev/) for setup instructions.

### GitHub Actions Example

```yaml
- name: Run E2E tests
  run: |
    curl -Ls "https://get.maestro.mobile.dev" | bash
    export PATH="$PATH:$HOME/.maestro/bin"
    maestro cloud --app-file=app.apk e2e/.maestro/
```

## Debugging Failed Tests

- **Use `maestro studio`** -- launches an interactive session where you can run commands one at a time and inspect the screen hierarchy.
- **Screenshots** -- Maestro captures screenshots on failure automatically when run via `maestro cloud`.
- **Increase timeout** -- Add `timeout` to assertions if elements take time to appear:
  ```yaml
  - assertVisible:
      text: "Loaded"
      timeout: 10000
  ```
- **Check element hierarchy** -- Use `maestro hierarchy` to dump the current view tree and verify element labels.

## Alternatives

### Detox

[Detox](https://wix.github.io/Detox/) is a gray-box E2E testing framework for React Native. It offers deeper integration with React Native internals (e.g., synchronization with the bridge) but requires more setup, JavaScript test code, and tighter coupling to the build system. Consider Detox if you need fine-grained control over test synchronization or already have a Detox-based test suite.
