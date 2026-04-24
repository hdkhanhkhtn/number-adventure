# Directory Structure

```
NumberAdventure/
│
├── CLAUDE.md                         # AI workspace context (project-specific)
├── AGENTS.md                         # OpenCode orchestrator instructions
├── README.md                         # Project overview
│
├── .claude/                          # AI workspace config
│   ├── agents/                       # AI agent definitions
│   ├── commands/                     # Command routers (/cook, /fix, /plan, ...)
│   ├── hooks/                        # Automated hooks
│   ├── rules/                        # Workflow rules (CORE, PHASES, AGENTS, ...)
│   ├── skills/                       # Domain skills
│   ├── contexts/                     # Context modes (dev, review, debug, ...)
│   ├── metadata.json                 # Project metadata
│   └── settings.json                 # Hook configuration
│
├── handoff/                          # Claude Design handoff bundle
│   └── number-adventure/
│       ├── README.md                 # Handoff instructions
│       └── project/                  # Design prototype files
│           ├── tokens.css            # Design tokens
│           ├── Bắp Design System.html
│           ├── Bắp Number Adventure.html
│           ├── [Screen].html         # Per-screen HTML prototypes
│           └── *.jsx                 # React component prototypes
│
├── src/                              # Source component prototypes (from handoff)
│   ├── app.jsx
│   ├── games.jsx
│   ├── ui.jsx
│   ├── mascot.jsx
│   ├── ios-frame.jsx
│   ├── tokens.css
│   └── screens-*.jsx
│
├── docs/                             # Project documentation
│   ├── implementation/               # Implementation guides (from handoff)
│   ├── knowledge-overview/           # Project identity, tech stack, features
│   ├── knowledge-architecture/       # System overview, components, data flow
│   ├── knowledge-domain/             # Game logic, data models, business rules
│   ├── knowledge-source-base/        # This directory structure doc
│   ├── knowledge-standards/          # Code style, git, testing, design-to-code
│   ├── business/                     # PRD, features, workflows, glossary
│   ├── decisions/                    # ADRs
│   ├── runbooks/                     # Operational procedures
│   └── sprints/                      # Roadmap, sprint plans
│
└── plans/                            # Implementation plans
    └── reports/                      # Agent reports
```

## Next.js App Structure (to be created)

```
app/
  layout.tsx
  page.tsx                            # → redirect to /child/home
  (child)/
    layout.tsx                        # Child shell (no parent nav)
    home/page.tsx
    world/page.tsx
    game/[gameId]/page.tsx
  (parent)/
    layout.tsx                        # Parent shell (back nav)
    dashboard/page.tsx
    settings/page.tsx

components/
  ui/
    Button.tsx
    Card.tsx
    NumberTile.tsx
    ProgressBar.tsx
    StarRating.tsx
  game/
    GameContainer.tsx
    QuestionDisplay.tsx
    AnswerGrid.tsx
    FeedbackOverlay.tsx
    CelebrationScreen.tsx
  layout/
    AppShell.tsx
    IOSFrame.tsx
    MascotBap.tsx

lib/
  game-engine/
    question-generator.ts
    answer-validator.ts
    difficulty-calculator.ts
  hooks/
    useAudio.ts
    useGame.ts
    useProgress.ts
  utils/
    number-helpers.ts
    storage.ts

data/
  game-config/
    hear-tap.ts
    number-order.ts
    build-number.ts
    even-odd.ts
    math-kitchen.ts
  levels/
    world-1.ts
    world-2.ts
```
