# Directory Structure

```
NumberAdventure/
│
├── CLAUDE.md                         # AI workspace context (project-specific)
├── AGENTS.md                         # OpenCode orchestrator instructions
├── README.md                         # Project overview
├── vercel.json                       # Phase 3C: Vercel Cron config
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
  │   ├── login/route.ts             # POST parent login
  │   ├── register/route.ts          # POST parent register
  │   └── pin/route.ts               # POST parent PIN verify
  ├── children/
  │   ├── route.ts                   # GET list, POST create
  │   └── [id]/
  │       ├── settings/route.ts      # GET/PATCH ChildSettings
  │       └── stickers/route.ts      # GET earned stickers
  ├── sessions/
  │   ├── route.ts                   # POST create GameSession
  │   └── [id]/
  │       ├── route.ts               # PATCH complete GameSession
  │       └── attempts/route.ts      # POST GameAttempt
  ├── ai/
  │   └── generate-questions/route.ts # POST → calls AI endpoint
  ├── progress/
  │   └── [childId]/route.ts         # GET GameSession[] + streak
  ├── report/
  │   └── [childId]/route.ts         # GET aggregated progress report
  ├── lessons/
  │   └── [lessonId]/route.ts        # GET lesson data
  ├── stickers/
  │   └── route.ts                   # GET all stickers + earned
  ├── worlds/
  │   └── route.ts                   # GET world list
  ├── streaks/
  │   └── [childId]/route.ts         # GET streak data
  ├── parent/ (Phase 3C)
  │   ├── children/route.ts          # GET/POST child profiles; PUT [id] update
  │   ├── encouragement/route.ts     # GET/POST/PATCH encouragement messages
  │   ├── settings/route.ts          # GET/PATCH parent settings (emailReports)
  │   └── unsubscribe/route.ts       # GET unsubscribe token verify
  ├── cron/ (Phase 3C)
  │   └── weekly-report/route.ts     # GET Vercel Cron endpoint; Bearer auth
  └── children/migrate/route.ts       # Phase 3A: POST guest→child migration
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
    reward/page.tsx
    stickers/page.tsx
  (parent)/
    layout.tsx                       # Parent shell + PIN gate
    dashboard/page.tsx               # Parent dashboard
    settings/page.tsx                # Parent settings
    report/page.tsx                  # Parent progress report

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
  parent/
    parent-gate.tsx                  # PIN entry modal
    metric-card.tsx                  # Progress metric card
    skill-row.tsx                    # Skill line item
    menu-row.tsx                     # Menu option row
    panel.tsx                        # Styled panel container
    lang-option.tsx                  # Language toggle
    setting-row.tsx                  # Setting line item
    weekly-chart.tsx                 # Progress chart
  screens/
    parent-dashboard-content.tsx
    parent-settings-content.tsx
    parent-report-content.tsx
    child-switcher-modal.tsx           # Phase 3C: multi-child profile switcher
    encouragement-banner.tsx           # Phase 3C: parent message display
    family-leaderboard.tsx             # Phase 3C: all-time stars ranking
    save-progress-banner.tsx           # Phase 3A: guest→child migration prompt

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
  email/ (Phase 3C)
    send-weekly-report.ts            # Resend init + batch reporting
    weekly-report-template.tsx       # React Email template
    unsubscribe-token.ts             # HMAC-SHA256 token utils
  export/ (Phase 3C)
    export-progress.ts               # CSV/PDF client-side download
  schemas/ (Phase 3B)
    lesson-schema.ts                 # Zod validation for AI-generated lessons
  lesson-loader.ts (Phase 3B)        # Feature-flagged loader (DB vs static fallback)
  hooks/
    useAudio.ts
    useGame.ts
    useProgress.ts
    useSession.ts
    use-settings.ts                  # Phase 3A: localStorage + debounced DB sync
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
    count-objects.ts                 # Phase 3B: visual counting
    number-writing.ts                # Phase 3B: digit input & writing
  worlds/
    world-1-farm.ts
    world-2-space.ts
    world-3-ocean.ts
    world-4-jungle.ts
    world-5-math-kitchen.ts
    world-6-counting-meadow.ts       # Phase 3B: count-objects game type
    world-7-writing-workshop.ts      # Phase 3B: number-writing game type
```
