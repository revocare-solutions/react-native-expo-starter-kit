Create a new PR from the current branch against main.

**Instructions:**

**Step 1: Branch check**
- Run `git branch --show-current` to get the current branch name.
- If the branch is `main` or `master`:
  - Run `git status` to check for uncommitted changes. If there are no changes, STOP and tell the user: "No changes to create a PR from."
  - Generate a short, descriptive branch name based on the staged/unstaged changes (e.g., `fix/login-validation`, `feat/add-user-search`).
  - Run `git checkout -b <branch-name>` to create and switch to the new branch.

**Step 2: Stage and commit ALL changes**
- Run `git add -A` to stage all changed, added, and deleted files.
- Run `git status` to check if there is anything staged.
- If there are staged changes, create a single commit with a descriptive message using a HEREDOC.
- If there is nothing to commit, skip this step.

**Step 3: Push the branch to remote**
- Run `git push -u origin $(git branch --show-current)` to push the branch and set upstream tracking.

**Step 4: Gather all changes in the branch**
Run these commands in parallel:
- `git log main..HEAD --oneline` to see all commits on this branch.
- `git diff main...HEAD --stat` to see a summary of all files changed.
- `git diff main...HEAD` to see the full diff of all changes.

**Step 5: Analyze changes and draft the PR**
- Analyze ALL commits and the full diff to understand the complete set of changes.
- Draft a concise PR title (under 70 characters) that captures the overall purpose.
- Draft a PR description using the format: Summary (1-3 bullet points), Changes (bulleted list), Test plan (bulleted checklist), and "Generated with Claude Code".

**Step 6: Create the PR**
- Use `gh pr create --base main --title "..." --body "$(cat <<'EOF' ... EOF)"` to create the PR.
- Use a HEREDOC for the body to ensure correct formatting.
- After creating, show the PR URL to the user.
