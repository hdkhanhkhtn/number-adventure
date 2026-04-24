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

### Backend (API Routes)
```
app/api/
  ├── auth/
  │   ├── session/route.ts           # GET current child
  │   └── pin/route.ts               # POST parent PIN verify
  ├── children/
  │   ├── route.ts                   # GET list, POST create
  │   └── [childId]/
  │       ├── settings/route.ts      # PUT ChildSettings
  │       └── stickers/route.ts      # GET earned stickers
  ├── sessions/
  │   ├── start/route.ts             # POST create GameSession
  │   ├── attempt/route.ts           # POST GameAttempt
  │   └── complete/route.ts          # POST complete GameSession
  ├── ai/
  │   └── generate/route.ts          # POST → calls AI endpoint
  ├── progress/
  │   └── route.ts                   # GET GameSession[] + streak
  ├── parent-report/
  │   └── route.ts                   # GET simple report
  └── stickers/
      └── route.ts                   # GET all stickers + earned
```

### Prisma (Database)
```
prisma/
  ├── schema.prisma                  # Full DB schema
  └── migrations/                    # SQL migrations
```

### Frontend (Pages + Components)
```
app/
  layout.tsx                         # Root, Providers setup
  page.tsx                           # → redirect to /child/home
  (child)/
    layout.tsx                       # Child shell
    home/page.tsx
    worlds/[worldId]/page.tsx        # World screen
    play/[gameType]/[lessonId]/page.tsx  # Game screen
  (parent)/
    layout.tsx                       # Parent shell + PIN gate
    dashboard/page.tsx               # Parent dashboard
    settings/page.tsx                # Parent settings

components/
  ui/
    Button.tsx
    Card.tsx
    NumberTile.tsx
    ProgressBar.tsx
    StarRating.tsx
    StreakCard.tsx
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
  db/
    client.ts                        # Prisma client setup
  ai/
    generate.ts                      # AI request + validation
  game-engine/
    question-generator.ts
    answer-validator.ts
    difficulty-calculator.ts
  services/
    audio.ts                         # AudioService (Web Speech + Howler)
  hooks/
    useAudio.ts
    useGame.ts
    useProgress.ts
    useSession.ts
  utils/
    number-helpers.ts
    storage.ts

data/
  game-config/
    hear-tap.ts
    number-order.ts
    build-number.ts
    even-odd.ts
    add-take.ts                      # Math Kitchen game type
  worlds/
    world-1-farm.ts
    world-2-space.ts
    world-3-ocean.ts
    world-4-jungle.ts
    world-5-math-kitchen.ts
```
