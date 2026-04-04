Check if the current worktree has any work that needs to be saved before deletion.

**Instructions:**

Run ALL of these checks in parallel, then present a summary.

**Check 1: Uncommitted changes**
- Run `git status --porcelain` to detect staged, unstaged, and untracked files.

**Check 2: Unpushed commits**
- Run `git log @{upstream}..HEAD --oneline 2>/dev/null` to find commits not yet pushed.
- If upstream is not set, run `git log origin/main..HEAD --oneline` instead (branch may never have been pushed).

**Check 3: Existing PR**
- Run `gh pr view --json url,title,state 2>/dev/null` to check if a PR exists for this branch.

**Check 4: Stashed changes**
- Run `git stash list` to check for any stashed work.

**Check 5: Branch info**
- Run `git branch --show-current` to get the branch name.
- Run `git log --oneline -5` to show recent commits for context.

**Present Summary:**
Display a clear status report with a table showing status of each check, using "None" for clean checks. If everything is clean and a PR exists (or there are no branch-specific commits), say "Safe to delete." Otherwise, say "Action needed before deleting." and list what to do.
