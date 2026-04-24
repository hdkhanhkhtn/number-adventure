# BAP NUMBER ADVENTURE — AI WORKSPACE CONTEXT

> MANDATORY BOOT SEQUENCE — EXECUTE BEFORE ANY OTHER ACTION
> 1. **READ NOW**: `.claude/rules/CORE.md`
> 2. **INTERNALIZE**: Orchestration Laws, Iron Laws, Tiered Execution
> 3. **ACTIVATE**: Orchestrator mode (delegate, NEVER implement)
>
> Design source: `handoff/number-adventure/project/` — read before implementing any screen.
> **Context sâu hơn:** `docs/` folder — đọc khi cần phân tích thiết kế.

---

## 1. PROJECT SNAPSHOT

**Tên:** Bap Number Adventure — Game học số cho trẻ em
**Dev by:** Huỳnh Duy Khánh (KIMEI Global)
**PM:** khanhhd · kimei.outside@gmail.com
**Phase hiện tại:** Phase 1 — MVP Implementation
**Roadmap:** Ph1 MVP ← (current) → Ph2 Content Expansion → Ph3 Multiplayer/Social

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| State | React Context + useReducer |
| Audio | Web Audio API / Howler.js |
| Animation | Framer Motion |
| Testing | Jest + Testing Library |

---

## 3. PROJECT STRUCTURE

```
app/
  layout.tsx              # Root layout
  page.tsx                # Entry (redirect to /child/home)
  (child)/
    home/                 # Child home screen
    world/                # World map screen
    game/[gameId]/        # Game screen (dynamic)
  (parent)/
    dashboard/            # Parent dashboard
    settings/             # Parent settings

components/
  ui/                     # Reusable UI: Button, Card, NumberTile, ProgressBar
  game/                   # Game-specific: GameContainer, Question, AnswerGrid
  layout/                 # Layout: AppShell, IOSFrame, Header

lib/
  game-engine/            # Question generation, answer validation, difficulty control
  hooks/                  # useAudio, useGame, useProgress
  utils/                  # helpers

data/
  game-config/            # Game type configurations
  levels/                 # Level data per game

public/
  audio/                  # Sound effects & voice
  images/                 # Mascot Bắp, stickers, backgrounds
```

---

## 4. FEATURES

| Feature | Screen | Status |
|---|---|---|
| Child Home | `(child)/home` | Phase 1 |
| World Map | `(child)/world` | Phase 1 |
| Hear & Tap Game | `(child)/game/hear-tap` | Phase 1 |
| Number Order Game | `(child)/game/number-order` | Phase 1 |
| Build the Number Game | `(child)/game/build-number` | Phase 1 |
| Even or Odd Game | `(child)/game/even-odd` | Phase 1 |
| Math Kitchen Game | `(child)/game/math-kitchen` | Phase 1 |
| Reward & Celebrations | shared | Phase 1 |
| Parent Dashboard | `(parent)/dashboard` | Phase 1 |
| Parent Settings | `(parent)/settings` | Phase 1 |

---

## 5. DESIGN SOURCE

All design prototypes live in `handoff/number-adventure/project/`:

| File | Purpose |
|---|---|
| `Bắp Number Adventure.html` | Master design reference |
| `Bắp Design System.html` | Colors, typography, tokens |
| `Bắp IA & User Flows.html` | Navigation & user flows |
| `Bắp Art Direction Guide.html` | Visual style, mascot usage |
| `Bắp Microcopy Guide.html` | Copy, labels, tones |
| `Home Screen Designs.html` | Child home screen |
| `World Map Designs.html` | World map screen |
| `Hear & Tap Game UI.html` | Mini-game 1 |
| `Number Order Game UI.html` | Mini-game 2 |
| `Build the Number Game UI.html` | Mini-game 3 |
| `Even or Odd House Game UI.html` | Mini-game 4 |
| `Math Kitchen Game UI.html` | Mini-game 5 |
| `Reward & Celebration Screens.html` | Reward screens |
| `Parent Dashboard Home.html` | Parent dashboard |
| `Parent Progress Details.html` | Progress detail |
| `Parent Gate Screen.html` | Parental lock gate |
| `Parent Settings.html` | Settings screen |
| `Sticker Collection Screen.html` | Sticker rewards |
| `Daily Progress & Streak Screen.html` | Progress/streak |
| `tokens.css` | Design tokens (colors, spacing, fonts) |

**Source component files** (in `src/`): `app.jsx`, `games.jsx`, `ui.jsx`, `mascot.jsx`, `ios-frame.jsx`, `tokens.css`, `screens-*.jsx`

---

## 6. GAME ENGINE

Each game is config-driven:

```typescript
type GameConfig = {
  type: "hear-tap" | "number-order" | "build-number" | "even-odd" | "math-kitchen"
  difficulty: "easy" | "medium" | "hard"
  data: GameData
}
```

Engine responsibilities: generate questions, validate answers, control difficulty, track progress.

---

## 7. UX RULES

- **Mobile-first** — designed for smartphone portrait
- **Touch-first** — tap & drag interactions, no hover dependencies
- **Large UI elements** — min 48×48px touch targets
- **Audio-first** — every interaction has audio feedback; voice reads numbers
- **Child-safe** — no external links, no ads, parent gate for settings

---

## 8. AI BEHAVIOR — BẮT BUỘC

### INSTRUCTION HIERARCHY
1. **User's explicit instructions** — ALWAYS highest priority
2. **Project CLAUDE.md** — project-specific rules
3. **Active skill instructions** — when skill is invoked
4. **Default agent behavior** — baseline

### IRON LAWS (NON-NEGOTIABLE)
- No production code without failing test first (TDD)
- No completion claims without fresh verification evidence
- No fixes without root cause investigation first
- Two-stage review: spec compliance THEN code quality
- No placeholders in plans — exact code, exact paths, exact commands
- Prior deliverables are IMMUTABLE constraints (L8)
- **Always read design file before implementing any screen**

### GIT SAFETY — NON-NEGOTIABLE
> ⚠️ This rule is always loaded.
- **NEVER commit directly to `main` or `develop`**
- Create feature branch → commit → push → PR
- Workflow: `git checkout -b <type>/<name>` → commit → `git push -u origin <branch>` → `gh pr create`
- Branch types: `feature/`, `fix/`, `refactor/`, `docs/`, `test/`, `chore/`, `hotfix/`
- Full protocol: `rules/git-workflow-rules.md`

### OUTPUT
- Code / commits: **English**
- Communication: **Tiếng Việt** hoặc **English** (theo user)
- Task "Done": tests pass + pixel-perfect vs design + CLAUDE.md updated nếu cần

### CONTEXT
- Read design file for the target screen before implementing
- Context > 50% → `/compact`

---

## 9. COMMAND ROUTING

| Command | Variants | Description |
|---|---|---|
| `/cook` | `:fast` `:hard` `:focus` `:team` | Build features |
| `/fix` | `:fast` `:hard` `:focus` `:team` | Fix bugs |
| `/plan` | `:fast` `:hard` `:team` | Create plans |
| `/debug` | `:fast` `:hard` `:focus` | Debug issues |
| `/review` | `:fast` `:hard` `:team` | Code review |
| `/test` | `:fast` `:hard` | Run/write tests |
| `/brainstorm` | `:fast` `:hard` | Brainstorming |
| `/docs` | `:core` `:audit` | Documentation |

**Natural language**: "implement/build" → `/cook` | "fix/bug" → `/fix` | "plan" → `/plan`
See `rules/CORE.md → COMMAND ROUTING` for full table.

---

## 10. WORKFLOWS & SKILLS

- Rules: `.claude/rules/CORE.md` (load FIRST)
- Primary: `.claude/rules/primary-workflow.md`
- Dev rules: `.claude/rules/development-rules.md`

| Trigger | Skill |
|---|---|
| Creative work | `brainstorming` |
| Multi-step tasks | `writing-plans` |
| Executing plan | `executing-plans` |
| Code review | `requesting-code-review` |
| Bug/failure | `systematic-debugging` |
| Writing tests | `test-driven-development` |
| Completion claims | `verification-before-completion` |
| Parallel tasks | `dispatching-parallel-agents` |
| Sub-agent work | `subagent-driven-development` |
| Branch done | `finishing-a-development-branch` |
| Refactor | `refactor` |
| UI design work | `ui-ux-designer` |

---

## 11. DOCS & TOOLS

### Documentation Structure (`./docs/`)

```
docs/
├── knowledge-overview/         # Project identity, tech stack, features
├── knowledge-architecture/     # System overview, components, data flow
├── knowledge-domain/           # Game logic, data models, business rules
├── knowledge-source-base/      # Directory structure, entry points, modules
├── knowledge-standards/        # Code style, conventions, git, testing
├── business/
│   ├── business-prd/           # PRD, goals, requirements
│   ├── business-features/      # Feature inventory, specs
│   ├── business-workflows/     # User flows, actor map
│   └── business-glossary/      # Domain terms
├── decisions/                  # ADRs
├── runbooks/                   # Operational procedures
├── sprints/                    # Sprint plans, roadmap
└── implementation/             # Implementation guides (handoff docs)
```

### Tool & Path Reference

| Purpose | Path |
|---|---|
| Design prototypes | `handoff/number-adventure/project/` |
| Design tokens | `handoff/number-adventure/project/tokens.css` |
| Source prototypes | `src/` (app.jsx, games.jsx, ui.jsx, ...) |
| Implementation docs | `docs/implementation/` |
| Plans | `plans/` |
| Reports | `plans/reports/` |

## 12. HOOK RESPONSE PROTOCOL

Khi tool bị block bởi privacy-hook (`@@PRIVACY_PROMPT@@`): parse JSON → dùng `AskUserQuestion` → nếu approve thì dùng `bash cat "filepath"`.
Python scripts: `.claude/skills/.venv/bin/python3 scripts/xxx.py`
