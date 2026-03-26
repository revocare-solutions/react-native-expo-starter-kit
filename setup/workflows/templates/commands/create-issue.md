Create a GitHub issue for tracking work.

Ask the user for:
1. Issue title
2. Description
3. Labels: bug, feature, enhancement, docs (can select multiple)

Run:
```bash
gh issue create --title "{title}" --body "{description}" --label "{labels}"
```

If the `gh` CLI is not installed, format the issue as markdown output the user can copy-paste into GitHub's web UI.
