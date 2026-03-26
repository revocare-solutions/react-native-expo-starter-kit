Create a feature branch following the project's naming convention.

Ask the user for:
1. Type: feature, fix, or refactor
2. Short description (will be converted to kebab-case)

Map type to prefix:
- feature → `ft/`
- fix → `fix/`
- refactor → `refactor/`

Run:
```bash
git checkout main
git pull origin main
git checkout -b {prefix}{description-in-kebab-case}
```
