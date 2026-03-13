# CI/CD Pipelines

This project uses GitHub Actions for continuous integration and build automation.

## CI Pipeline

The CI pipeline (`.github/workflows/ci.yml`) runs automatically on every push to `main` and on pull requests targeting `main`. It performs the following checks:

1. **Lint** -- Runs `pnpm lint` to enforce code style and catch common issues via ESLint.
2. **Type Check** -- Runs `pnpm typecheck` (`tsc --noEmit`) to verify TypeScript types without emitting output.
3. **Test** -- Runs `pnpm test -- --ci --coverage` to execute the full Jest test suite with coverage reporting.

All three checks must pass before a pull request can be merged.

### Viewing CI Results

- Open any pull request on GitHub and scroll to the bottom to see the status checks.
- Click **Details** next to the "Lint, Type Check & Test" check to view the full log output.
- A green checkmark means all checks passed; a red X indicates a failure that must be fixed.

## EAS Build Pipeline

The EAS Build pipeline (`.github/workflows/eas-build.yml`) is triggered manually via `workflow_dispatch`. It builds the app using Expo Application Services (EAS).

### Trigger Options

When triggering the workflow from the GitHub Actions tab, you choose:

| Input      | Options                            | Default   |
|------------|------------------------------------|-----------|
| `platform` | `all`, `ios`, `android`            | `all`     |
| `profile`  | `development`, `preview`, `production` | `preview` |

### How to Trigger

1. Go to the **Actions** tab in the GitHub repository.
2. Select **EAS Build** from the workflow list on the left.
3. Click **Run workflow**, select the branch, platform, and profile, then click the green **Run workflow** button.

## Setting Up the EXPO_TOKEN Secret

The EAS Build workflow requires an `EXPO_TOKEN` secret to authenticate with Expo.

1. Generate a token at [expo.dev/accounts/[account]/settings/access-tokens](https://expo.dev/accounts).
2. In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
3. Click **New repository secret**.
4. Set the name to `EXPO_TOKEN` and paste the token as the value.
5. Click **Add secret**.

## Adding Custom CI Steps

To add a new step to the CI pipeline, edit `.github/workflows/ci.yml` and add a step after the existing ones. For example:

```yaml
      - name: Custom check
        run: pnpm my-custom-script
```

Make sure any new script is defined in `package.json` under `scripts`.

## README Badge

Add a CI status badge to your README by including the following Markdown (replace `OWNER` and `REPO`):

```markdown
![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)
```

This displays the current status of the CI pipeline on the `main` branch.
