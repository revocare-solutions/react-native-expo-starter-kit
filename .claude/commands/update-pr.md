Update the PR for the current branch by committing all changes, force-pushing, and updating the PR description.

**Instructions:**

**Step 1: Safety check**
- Run `git branch --show-current` to get the current branch name.
- If the branch is `main` or `master`, STOP immediately and tell the user: "Cannot update PR from the main/master branch. Switch to a feature branch first."

**Step 2: Stage and commit everything**
- Run `git add -A` to stage all files (tracked, untracked, deleted — everything).
- Run `git status` to confirm what's being committed.
- Create a single commit with a descriptive message based on the changes. Use a HEREDOC for the commit message.
- If there are no changes to commit, skip this step and proceed.

**Step 3: Force-push to remote**
- Run `git push --force-with-lease origin $(git branch --show-current)` to push all changes to the remote branch, overwriting whatever was there.

**Step 4: Gather all changes in the branch**
Run these commands in parallel:
- `git log main..HEAD --oneline` to see all commits on this branch since it diverged from main.
- `git diff main...HEAD --stat` to see a summary of all files changed.
- `git diff main...HEAD` to see the full diff of all changes.

**Step 5: Find the existing PR**
- Run `gh pr list --head $(git branch --show-current) --json number,title,body,url --limit 1` to find the PR for this branch.
- If no PR exists, tell the user "No PR found for this branch. Use /pr to create one." and STOP.

**Step 6: Analyze changes and draft updates**
- Analyze ALL commits and the full diff to understand the complete set of changes.
- Draft a concise PR title (under 70 characters) that captures the overall purpose.
- Draft a PR description using the format: Summary (1-3 bullet points), Changes (bulleted list), Test plan (bulleted checklist), and "Generated with Claude Code".

**Step 7: Update the PR**
- Use `gh pr edit <number> --title "..." --body "$(cat <<'EOF' ... EOF)"` to update the PR title and body.
- Use a HEREDOC for the body to ensure correct formatting.
- After updating, show the PR URL to the user.
