# Git Conventions

## Branch Naming

```
<type>/<descriptive-kebab-name>

feature/child-home-screen
feature/hear-tap-game
fix/audio-not-playing-ios
refactor/game-engine-split
docs/update-roadmap
test/game-engine-unit-tests
chore/tailwind-token-setup
```

## Protected Branches

- `main` — production-ready, never commit directly
- `develop` — staging (if used)

**Always:** `feature branch → PR → review → merge`

## Commit Format (Conventional Commits)

```
<type>(<scope>): <description>

feat(game):     add Hear & Tap question generator
fix(audio):     resolve iOS Web Audio unlock issue
refactor(ui):   extract NumberTile from GameContainer
test(engine):   add unit tests for answer-validator
docs(readme):   update setup instructions
chore(deps):    upgrade framer-motion to v11
style(tiles):   align number tiles to design tokens
```

**Rules:**
- Subject line < 72 chars, imperative mood ("add" not "added")
- No AI references in commit messages
- One logical change per commit

## PR Process

1. `git checkout -b feature/<name>`
2. Implement + test locally
3. `git push -u origin feature/<name>`
4. `gh pr create` — fill title + description
5. Self-review diff before requesting review
6. Merge only after approval

## Pre-commit Checks

```bash
npm run lint        # ESLint
npm run type-check  # tsc --noEmit
npm test            # Jest (run affected tests)
```
