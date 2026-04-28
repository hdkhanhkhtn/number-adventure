# Data Models

## Database Schema (PostgreSQL + Prisma)

### Parent
```prisma
model Parent {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  pinHash      String?  // bcrypt hashed 4-digit parent gate
  name         String?
  emailReports Boolean  @default(true)  // Phase 3C: opt-out model for weekly email
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  children     Child[]
  messages     EncouragementMessage[]   // Phase 3C: parent-written messages
}
```

### Child
```prisma
model Child {
  id        String   @id @default(cuid())
  parentId  String
  name      String
  age       Int
  avatarColor String  // hex or theme name
  createdAt DateTime @default(now())
  
  parent    Parent @relation(fields: [parentId], references: [id])
  settings  ChildSettings?
  sessions  GameSession[]
  stickers  ChildSticker[]
  streak    Streak?
}
```

### ChildSettings
```prisma
model ChildSettings {
  id              String   @id @default(cuid())
  childId         String   @unique
  dailyMinutes    Int      @default(30)
  difficulty      String   @default("easy")  // easy | medium | hard
  language        String   @default("en")    // en | vi | bi
  audioEnabled    Boolean  @default(true)
  celebrationsOn  Boolean  @default(true)
  
  child           Child @relation(fields: [childId], references: [id])
}
```

### Lesson (static config, stored in DB for reference)
```prisma
model Lesson {
  id        String   @id  // "math-kitchen-add-1"
  worldId   String      // "math-kitchen"
  gameType  String      // "add-take"
  title     String
  order     Int
  skillTags String[]    // ["addition", "tens"]
  
  sessions  GameSession[]
  questions AIQuestion[]
}
```

### GameSession
```prisma
model GameSession {
  id        String   @id @default(cuid())
  childId   String
  lessonId  String
  startedAt DateTime @default(now())
  completedAt DateTime?
  stars     Int?     // 0-3
  accuracy  Float?   // percentage
  
  child     Child @relation(fields: [childId], references: [id])
  lesson    Lesson @relation(fields: [lessonId], references: [id])
  attempts  GameAttempt[]
}
```

### GameAttempt
```prisma
model GameAttempt {
  id        String   @id @default(cuid())
  sessionId String
  questionId String
  answeredCorrectly Boolean
  timeMs    Int      // response time
  createdAt DateTime @default(now())
  
  session   GameSession @relation(fields: [sessionId], references: [id])
  question  AIQuestion @relation(fields: [questionId], references: [id])
}
```

### AIQuestion (cached AI output)
```prisma
model AIQuestion {
  id            String   @id @default(cuid())
  lessonId      String
  gameType      String   // "add-take", "hear-tap", etc.
  prompt        String   // "What is 5 + 3?"
  options       String[] // ["7", "8", "9"] as JSON
  correctAnswer String   // "8"
  generatedAt   DateTime @default(now())
  
  lesson        Lesson @relation(fields: [lessonId], references: [id])
  attempts      GameAttempt[]
}
```

### Sticker
```prisma
model Sticker {
  id              String   @id
  name            String
  world           String   // "math-kitchen", "farm", etc.
  imageUrl        String
  unlockCondition String   // rule that unlocks it
  
  childStickers   ChildSticker[]
}
```

### ChildSticker
```prisma
model ChildSticker {
  id        String   @id @default(cuid())
  childId   String
  stickerId String
  earnedAt  DateTime @default(now())
  
  child     Child @relation(fields: [childId], references: [id])
  sticker   Sticker @relation(fields: [stickerId], references: [id])
  
  @@unique([childId, stickerId])
}
```

### Streak
```prisma
model Streak {
  id          String   @id @default(cuid())
  childId     String   @unique
  currentStreak Int    @default(0)
  longestStreak Int    @default(0)
  lastActivityDate DateTime?
  
  child       Child @relation(fields: [childId], references: [id])
}
```

### EncouragementMessage (Phase 3C)
```prisma
model EncouragementMessage {
  id        String   @id @default(cuid())
  parentId  String
  childId   String
  message   String   // 1–200 characters
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  parent    Parent @relation(fields: [parentId], references: [id])
  child     Child @relation(fields: [childId], references: [id])
  
  @@index([childId, createdAt(sort: Desc)])  // for fetching latest unread
}
```

## Frontend Types (TypeScript)

```typescript
type GameType = "hear-tap" | "number-order" | "build-number" | "even-odd" | "add-take"
type Difficulty = "easy" | "medium" | "hard"

// UI session state (React Context)
type GameSession = {
  id: string
  childId: string
  lessonId: string
  questions: Question[]     // from DB
  currentQuestionIndex: number
  correctCount: number
  startedAt: Date
}

type Question = {
  id: string
  prompt: string
  options?: string[]
  correctAnswer: string
}

type ProgressSummary = {
  completedLessons: number
  totalStars: number
  recentActivity: GameSession[]
  streak: Streak
  stickers: string[]
}
```
