export function generateSettings(): object {
  return {
    permissions: {
      allow: [
        'Bash(pnpm lint)',
        'Bash(pnpm test)',
        'Bash(pnpm test:*)',
        'Bash(pnpm typecheck)',
        'Bash(pnpm start)',
        'Bash(pnpm start:*)',
        'Bash(git status*)',
        'Bash(git log*)',
        'Bash(git diff*)',
        'Bash(git branch*)',
        'Bash(git checkout*)',
        'Bash(git add*)',
        'Bash(git commit*)',
        'Bash(git push*)',
        'Bash(git pull*)',
        'Bash(git fetch*)',
        'Bash(gh issue*)',
        'Bash(gh pr*)',
      ],
    },
  };
}
