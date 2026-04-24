# Phase D: AudioService + Tests + Accessibility + Docker Deploy

## Context Links

- Prototype speech: `src/games.jsx` lines 42-49 (speechSynthesis usage in HearTap)
- Prototype audio settings: `src/screens-reward-parent.jsx` lines 303-319 (sfx/music/voice/voiceStyle)
- App settings state: `src/app.jsx` lines 24-28 (settings defaults)
- All CSS animations: `src/tokens.css` lines 113-151 (8 keyframes)
- Touch interaction patterns: all `onMouseDown/Up/Leave` handlers in `src/ui.jsx`
- Architecture spec: `docs/prompts/28_define_docs_planning_architecture.md` -- Decision #5 (Audio), #11 (Deployment)

## Overview

- **Priority:** P1 -- polish, quality, deployment
- **Status:** Pending
- **Description:** Implement AudioService (Web Speech API for MVP, optional Google TTS upgrade path), write tests for game engine and API endpoints, accessibility audit, Framer Motion integration, Docker production deployment with PostgreSQL + Nginx reverse proxy on VPS.

## Key Insights

- AudioService architecture supports multiple backends: Web Speech API (MVP default), Google TTS (optional), cached audio files (future)
- Prototype uses ONLY `window.speechSynthesis` in HearTap -- extend to all games for number reading
- `onMouseDown/Up/Leave` handlers must also work with touch (onTouchStart/End) for mobile
- Framer Motion replaces CSS keyframes for interactive animations only; keep CSS for decorative
- Docker deployment: Next.js standalone build + PostgreSQL 16 + Nginx reverse proxy
- All game engine functions are pure -- ideal for unit testing
- API endpoints need integration tests with test database

## Requirements

### Functional
- AudioService class with fallback chain: Web Speech API -> Google TTS (optional) -> silent
- AudioService methods: `playText(text)`, `playNumber(n)`, `playAudioFile(path)`, `generateAudio(text)` (optional)
- AudioContext wired to ChildSettings from DB (sfx/music/voice toggles)
- Tap-to-hear in HearTap game reads numbers aloud
- SFX stubs for correct/wrong/complete (real audio files deferred to Phase 2)
- Touch events alongside mouse events on all pressable elements
- Docker Compose production config: Next.js (standalone) + PostgreSQL + Nginx
- Dockerfile for Next.js app (multi-stage build)
- Nginx config for reverse proxy + SSL termination (optional)

### Non-functional
- WCAG AA compliance: color contrast, ARIA labels on interactive elements
- Touch targets: minimum 48x48px on all tappable elements
- Game engine: 100% test coverage for question generation + scoring
- API endpoint tests: session lifecycle, AI generation, report aggregation
- Lighthouse performance score > 90
- Docker image < 500MB
- Zero-downtime deploy capability

## Architecture

### AudioService
```
lib/
  audio/
    audio-service.ts          -- AudioService class (facade)
    web-speech-provider.ts    -- Web Speech API implementation
    google-tts-provider.ts    -- Google TTS implementation (optional, stub)
    types.ts                  -- AudioProvider interface, AudioConfig

  hooks/
    use-audio.ts              -- React hook wrapping AudioService
    use-sound-effects.ts      -- SFX hook (stub for MVP)

context/
  audio-context.tsx           -- (update from Phase A) Wire to AudioService + DB settings
```

### Tests
```
__tests__/
  lib/
    game-engine/
      hear-tap-engine.test.ts
      build-number-engine.test.ts
      even-odd-engine.test.ts
      number-order-engine.test.ts
      add-take-engine.test.ts
      score-calculator.test.ts
      question-loader.test.ts
  api/
    sessions.test.ts
    ai-generate.test.ts
    report.test.ts
    streaks.test.ts
  components/
    ui/
      num-tile.test.tsx
      big-button.test.tsx
    game/
      game-hud.test.tsx
```

### Deployment
```
Dockerfile                    -- Multi-stage: deps -> build -> runner
docker-compose.prod.yml       -- Production: app + db + nginx
nginx/
  nginx.conf                  -- Reverse proxy config
  ssl/                        -- SSL certs (mounted volume)
scripts/
  deploy.sh                   -- Deploy script for VPS
  seed.sh                     -- DB seed script
```

## Related Code Files

### Files to Create

| File | Source | Lines Est. |
|------|--------|-----------|
| `lib/audio/types.ts` | new | 25 |
| `lib/audio/audio-service.ts` | new | 80 |
| `lib/audio/web-speech-provider.ts` | `src/games.jsx` L42-49 + new | 60 |
| `lib/audio/google-tts-provider.ts` | new (stub) | 30 |
| `lib/hooks/use-audio.ts` | new | 50 |
| `lib/hooks/use-sound-effects.ts` | new (stub) | 40 |
| `__tests__/lib/game-engine/hear-tap-engine.test.ts` | new | 60 |
| `__tests__/lib/game-engine/build-number-engine.test.ts` | new | 40 |
| `__tests__/lib/game-engine/even-odd-engine.test.ts` | new | 35 |
| `__tests__/lib/game-engine/number-order-engine.test.ts` | new | 50 |
| `__tests__/lib/game-engine/add-take-engine.test.ts` | new | 50 |
| `__tests__/lib/game-engine/score-calculator.test.ts` | new | 30 |
| `__tests__/lib/game-engine/question-loader.test.ts` | new | 45 |
| `__tests__/api/sessions.test.ts` | new | 80 |
| `__tests__/api/ai-generate.test.ts` | new | 60 |
| `__tests__/api/report.test.ts` | new | 60 |
| `__tests__/components/ui/num-tile.test.tsx` | new | 50 |
| `__tests__/components/ui/big-button.test.tsx` | new | 40 |
| `__tests__/components/game/game-hud.test.tsx` | new | 35 |
| `Dockerfile` | new | 50 |
| `docker-compose.prod.yml` | new | 40 |
| `nginx/nginx.conf` | new | 45 |
| `scripts/deploy.sh` | new | 30 |
| `scripts/seed.sh` | new | 20 |

### Files to Modify

| File | Change |
|------|--------|
| `context/audio-context.tsx` | Wire AudioService, read settings from DB via context |
| `components/ui/num-tile.tsx` | Add ARIA labels, touch events, keyboard handler |
| `components/ui/big-button.tsx` | Add ARIA labels, touch events |
| `components/ui/icon-btn.tsx` | Add ARIA label, touch events |
| `components/game/game-hud.tsx` | Add ARIA labels |
| All game pages in `app/(child)/play/` | Wire useAudio for speak(), sound effects |

## Implementation Steps

### Step 1: AudioService Architecture

1. Create `lib/audio/types.ts`:
   ```typescript
   export interface AudioProvider {
     speak(text: string, options?: SpeakOptions): Promise<void>;
     stop(): void;
     isAvailable(): boolean;
   }

   export interface SpeakOptions {
     lang?: string;
     rate?: number;
     pitch?: number;
   }

   export interface AudioConfig {
     voiceEnabled: boolean;
     sfxEnabled: boolean;
     musicEnabled: boolean;
     voiceStyle: 'Friendly' | 'Slow' | 'Adult';
     kidLang: string;
   }
   ```

2. Create `lib/audio/web-speech-provider.ts`:
   ```typescript
   import type { AudioProvider, SpeakOptions } from './types';

   export class WebSpeechProvider implements AudioProvider {
     isAvailable(): boolean {
       return typeof window !== 'undefined' && 'speechSynthesis' in window;
     }

     async speak(text: string, options?: SpeakOptions): Promise<void> {
       if (!this.isAvailable()) return;
       return new Promise((resolve) => {
         window.speechSynthesis.cancel();
         const utterance = new SpeechSynthesisUtterance(text);
         utterance.lang = options?.lang ?? 'en-US';
         utterance.rate = options?.rate ?? 0.85;
         utterance.pitch = options?.pitch ?? 1.1;
         utterance.onend = () => resolve();
         utterance.onerror = () => resolve();
         window.speechSynthesis.speak(utterance);
       });
     }

     stop(): void {
       if (this.isAvailable()) window.speechSynthesis.cancel();
     }
   }
   ```

3. Create `lib/audio/google-tts-provider.ts` (stub for optional upgrade):
   ```typescript
   import type { AudioProvider, SpeakOptions } from './types';

   export class GoogleTTSProvider implements AudioProvider {
     isAvailable(): boolean {
       return false; // Enable when Google TTS API key configured
     }
     async speak(_text: string, _options?: SpeakOptions): Promise<void> {
       // TODO: Implement Google Cloud TTS API call
     }
     stop(): void {}
   }
   ```

4. Create `lib/audio/audio-service.ts`:
   ```typescript
   import type { AudioProvider, AudioConfig, SpeakOptions } from './types';
   import { WebSpeechProvider } from './web-speech-provider';
   import { GoogleTTSProvider } from './google-tts-provider';

   export class AudioService {
     private providers: AudioProvider[];
     private config: AudioConfig;

     constructor(config: AudioConfig) {
       this.config = config;
       this.providers = [new GoogleTTSProvider(), new WebSpeechProvider()];
     }

     private getProvider(): AudioProvider | null {
       return this.providers.find(p => p.isAvailable()) ?? null;
     }

     async playNumber(n: number): Promise<void> {
       if (!this.config.voiceEnabled) return;
       const provider = this.getProvider();
       if (!provider) return;

       const styleMap = {
         Friendly: { rate: 0.85, pitch: 1.1 },
         Slow: { rate: 0.65, pitch: 1.0 },
         Adult: { rate: 1.0, pitch: 0.9 },
       };
       const style = styleMap[this.config.voiceStyle] ?? styleMap.Friendly;
       const lang = this.config.kidLang === 'vi' ? 'vi-VN' : 'en-US';

       await provider.speak(String(n), { ...style, lang });
     }

     async playText(text: string): Promise<void> {
       if (!this.config.voiceEnabled) return;
       const provider = this.getProvider();
       if (!provider) return;
       const lang = this.config.kidLang === 'vi' ? 'vi-VN' : 'en-US';
       await provider.speak(text, { lang });
     }

     stop(): void {
       this.providers.forEach(p => p.stop());
     }

     updateConfig(config: Partial<AudioConfig>): void {
       this.config = { ...this.config, ...config };
     }
   }
   ```

### Step 2: Audio Hooks + Context Update

1. Create `lib/hooks/use-audio.ts`:
   ```typescript
   'use client';
   import { useContext, useMemo, useCallback } from 'react';
   import { AudioContext } from '@/context/audio-context';
   import { AudioService } from '@/lib/audio/audio-service';

   export function useAudio() {
     const audioConfig = useContext(AudioContext);
     const service = useMemo(() => new AudioService(audioConfig), [audioConfig]);

     const speakNumber = useCallback((n: number) => service.playNumber(n), [service]);
     const speakText = useCallback((t: string) => service.playText(t), [service]);
     const stop = useCallback(() => service.stop(), [service]);

     return { speakNumber, speakText, stop };
   }
   ```

2. Create `lib/hooks/use-sound-effects.ts` (stub for MVP):
   ```typescript
   'use client';
   import { useContext, useCallback } from 'react';
   import { AudioContext } from '@/context/audio-context';

   export function useSoundEffects() {
     const { sfxEnabled } = useContext(AudioContext);
     const playCorrect = useCallback(() => { if (!sfxEnabled) return; /* stub */ }, [sfxEnabled]);
     const playWrong = useCallback(() => { if (!sfxEnabled) return; /* stub */ }, [sfxEnabled]);
     const playLevelComplete = useCallback(() => { if (!sfxEnabled) return; /* stub */ }, [sfxEnabled]);
     return { playCorrect, playWrong, playLevelComplete };
   }
   ```

3. Update `context/audio-context.tsx`:
   - Read audio settings from GameProgressContext (which caches ChildSettings from DB)
   - Provide AudioConfig shape to children
   - Handle SSR: guard browser APIs behind `typeof window !== 'undefined'`

### Step 3: Wire Audio into Games

Update each game component in `app/(child)/play/[gameType]/[lessonId]/`:

1. **HearTap** (`hear-tap-game.tsx`):
   - Import `useAudio`
   - Call `speakNumber(question.target)` on round start and on speaker button tap
   - Port from `src/games.jsx` L40-49

2. **All 5 games**:
   - Import `useSoundEffects`
   - Call `playCorrect()` on correct answer
   - Call `playWrong()` on wrong answer
   - Call `playLevelComplete()` on game end

### Step 4: Touch Event Enhancement

Update pressable components to support both mouse AND touch:

For `NumTile`, `BigButton`, `IconBtn`:
```typescript
onTouchStart={(e) => {
  e.preventDefault(); // Prevent double-fire on hybrid devices
  e.currentTarget.style.transform = 'translateY(3px)';
}}
onTouchEnd={(e) => {
  e.preventDefault();
  e.currentTarget.style.transform = '';
}}
```

Alternative: use `onPointerDown/Up` for unified mouse+touch handling if conflicts arise.

### Step 5: Accessibility Audit

Add ARIA attributes to all interactive components:

1. **NumTile**: `role="button"`, `aria-label={String(n)}`, `aria-pressed`, `tabIndex={0}`, `onKeyDown` for Enter/Space
2. **BigButton**: `aria-disabled={disabled}`, ensure `disabled` attr set
3. **IconBtn**: `aria-label` describing the icon action (e.g., "Close", "Go back", "Listen")
4. **GameHud**: progress bar `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
5. **StarRow**: `aria-label={`${value} out of 3 stars`}`
6. **ProgressBar**: `role="progressbar"`, `aria-valuenow={value}`, `aria-valuemax={max}`
7. **ParentGate**: `role="dialog"`, `aria-modal="true"`, `aria-label="Parent verification"`

### Step 6: Framer Motion Integration

Keep as CSS keyframes (decorative, always-running):
- `bobble`, `sparkle`, `confetti-fall`, `pulse-soft`, `shimmer`

Convert to Framer Motion (interactive, conditional):
- `pop-in` -> `motion.div` with `initial={{ scale: 0.6, opacity: 0 }}` `animate={{ scale: 1, opacity: 1 }}`
- `wiggle` -> `motion.div` with shake animation on wrong answer
- `slide-up` -> `motion.div` with `initial={{ y: 24, opacity: 0 }}` for ParentGate

### Step 7: Jest Configuration + Tests

1. Install test dependencies:
   ```bash
   npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest
   ```

2. Create `jest.config.ts`:
   ```typescript
   import type { Config } from 'jest';
   import nextJest from 'next/jest';
   const createJestConfig = nextJest({ dir: './' });
   const config: Config = {
     testEnvironment: 'jsdom',
     setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
     moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
   };
   export default createJestConfig(config);
   ```

3. Create `jest.setup.ts`:
   ```typescript
   import '@testing-library/jest-dom';
   ```

4. **Game engine tests** (6 files):
   - `hear-tap-engine.test.ts`: target in range, 4 unique options, target in options
   - `build-number-engine.test.ts`: target in [11, 70]
   - `even-odd-engine.test.ts`: number in [2, 19], isEven correct
   - `number-order-engine.test.ts`: sequence consecutive, hideIdx valid, target correct
   - `add-take-engine.test.ts`: op is +/-, subtraction never negative, target correct, 4 options
   - `score-calculator.test.ts`: 3 hearts=3 stars, 2=2, 1=1, 0=1

5. **API endpoint tests** (3 files):
   - `sessions.test.ts`: POST creates session, PATCH completes session, POST attempt records
   - `ai-generate.test.ts`: validates AI response schema, falls back to local on failure
   - `report.test.ts`: aggregation returns correct counts, handles empty data

6. **UI component tests** (3 files):
   - `num-tile.test.tsx`: renders number, calls onClick, disabled state
   - `big-button.test.tsx`: renders children, disabled prevents click
   - `game-hud.test.tsx`: renders hearts, progress bar

### Step 8: Docker Production Deployment

1. Create `Dockerfile` (multi-stage):
   ```dockerfile
   # Stage 1: Dependencies
   FROM node:20-alpine AS deps
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci --only=production

   # Stage 2: Build
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npx prisma generate
   RUN npm run build

   # Stage 3: Runner
   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/prisma ./prisma
   COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. Add to `next.config.js`:
   ```javascript
   output: 'standalone',
   ```

3. Create `docker-compose.prod.yml`:
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:16-alpine
       restart: always
       environment:
         POSTGRES_USER: ${DB_USER}
         POSTGRES_PASSWORD: ${DB_PASSWORD}
         POSTGRES_DB: ${DB_NAME}
       volumes:
         - pgdata:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
         interval: 5s
         timeout: 5s
         retries: 5

     app:
       build:
         context: .
         dockerfile: Dockerfile
       restart: always
       environment:
         DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
         AI_ENDPOINT: ${AI_ENDPOINT}
         AI_MODEL: ${AI_MODEL}
         AI_API_KEY: ${AI_API_KEY}
       depends_on:
         db:
           condition: service_healthy
       expose:
         - "3000"

     nginx:
       image: nginx:alpine
       restart: always
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
         - ./nginx/ssl:/etc/nginx/ssl:ro
       depends_on:
         - app

   volumes:
     pgdata:
   ```

4. Create `nginx/nginx.conf`:
   ```nginx
   events { worker_connections 1024; }
   http {
     upstream app {
       server app:3000;
     }
     server {
       listen 80;
       server_name _;
       location / {
         proxy_pass http://app;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
         proxy_cache_bypass $http_upgrade;
       }
     }
   }
   ```

5. Create `scripts/deploy.sh`:
   ```bash
   #!/bin/bash
   set -e
   echo "Pulling latest code..."
   git pull origin main
   echo "Building and starting services..."
   docker compose -f docker-compose.prod.yml up -d --build
   echo "Running migrations..."
   docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   echo "Deployment complete!"
   ```

6. Create `scripts/seed.sh`:
   ```bash
   #!/bin/bash
   set -e
   echo "Seeding stickers..."
   docker compose -f docker-compose.prod.yml exec app npx prisma db seed
   ```

7. Create `prisma/seed.ts` for initial sticker data:
   - Import sticker definitions from `src/data/game-config/sticker-defs.ts`
   - Upsert all stickers into DB
   - Add seed script to `package.json`: `"prisma": { "seed": "ts-node prisma/seed.ts" }`

### Step 9: Performance Audit

1. Run Lighthouse:
   ```bash
   npx lighthouse http://localhost:3000/home --output=json --output-path=./lighthouse-report.json
   ```
2. Check: Performance > 90, CLS < 0.1
3. Next.js optimizations:
   - Game pages use dynamic imports: `dynamic(() => import('./hear-tap-game'))`
   - Verify `'use client'` only on components that need it
   - Check bundle size with `npm run build` output

### Step 10: Final Integration Test

Manual test checklist:
```
[ ] Fresh DB: register parent -> create child -> splash -> welcome -> profile -> home
[ ] Returning: localStorage has childId -> directly to home with DB data
[ ] Home: name from DB, StreakCard with streak from DB, play button -> world map
[ ] World map: worlds with progress from DB, locked/unlocked correct
[ ] Level list: stars per level from DB sessions
[ ] HearTap: speaker plays number (Web Speech API), AI questions loaded from DB
[ ] BuildNumber: adjust tens/ones, check button, attempts saved to DB
[ ] EvenOdd: tap basket, attempts saved to DB
[ ] NumberOrder: tap answer, attempts saved to DB
[ ] AddTake: pick answer, attempts saved to DB
[ ] Reward: confetti, stars, sticker (if 3 stars -> saved to DB), next button
[ ] Stickers: grid from DB (collected vs locked)
[ ] Parent gate: math challenge, correct opens dashboard
[ ] Dashboard: metrics from DB aggregation, StreakCard
[ ] Settings: all 3 tabs, changes persist to DB
[ ] Report: lessons completed, stars, skills, 7-day chart, accuracy -- all from DB
[ ] Theme switching: garden/candy/sunny
[ ] Touch on mobile: press effects work
[ ] Docker prod: docker-compose.prod.yml up -> app accessible via nginx
[ ] DB persistence: restart containers -> data intact
```

## Todo List

- [ ] Create `lib/audio/types.ts`
- [ ] Create `lib/audio/audio-service.ts`
- [ ] Create `lib/audio/web-speech-provider.ts`
- [ ] Create `lib/audio/google-tts-provider.ts` (stub)
- [ ] Create `lib/hooks/use-audio.ts`
- [ ] Create `lib/hooks/use-sound-effects.ts` (stub)
- [ ] Update `context/audio-context.tsx` to wire AudioService + DB settings
- [ ] Wire `useAudio` into HearTap (speak on round start + speaker tap)
- [ ] Wire `useSoundEffects` into all 5 games
- [ ] Add touch events to NumTile, BigButton, IconBtn
- [ ] Add ARIA labels to all interactive components
- [ ] Add keyboard handlers (Enter/Space) to button-like components
- [ ] Replace interactive CSS animations with Framer Motion (pop-in, wiggle, slide-up)
- [ ] Configure Jest + Testing Library
- [ ] Write game engine tests (7 test files)
- [ ] Write API endpoint tests (3 test files)
- [ ] Write UI component tests (3 test files)
- [ ] Create `Dockerfile` (multi-stage standalone build)
- [ ] Add `output: 'standalone'` to `next.config.js`
- [ ] Create `docker-compose.prod.yml`
- [ ] Create `nginx/nginx.conf`
- [ ] Create `scripts/deploy.sh`
- [ ] Create `scripts/seed.sh` + `prisma/seed.ts`
- [ ] Run Lighthouse audit and fix issues
- [ ] Complete full manual integration test
- [ ] Run `npm run build` -- zero errors
- [ ] Run `npm test` -- all tests pass
- [ ] Test Docker prod deployment locally

## Acceptance Criteria

1. `npm run build` passes with zero errors
2. `npm test` passes with all tests green (game engine + API + UI)
3. HearTap reads numbers aloud via AudioService (Web Speech API)
4. Audio respects DB settings (muting voice disables speech)
5. AudioService falls back gracefully when Web Speech API unavailable
6. All interactive elements work with both mouse and touch
7. All buttons have ARIA labels, keyboard Enter/Space support
8. ProgressBar has `role="progressbar"` with correct aria attributes
9. Framer Motion pop-in animation works on star rating
10. Lighthouse performance > 90 on `/home`
11. `docker-compose.prod.yml up` starts app + db + nginx, app accessible on port 80
12. Data persists across container restarts
13. `scripts/deploy.sh` executes without errors on VPS
14. Every file under 200 lines

## Dependencies

- Phase B must be complete (all games + screens + API endpoints to wire audio into)
- Phase C must be complete (ParentSettings audio tab persists to DB, report API)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Web Speech API unavailable on some browsers | Medium | Medium | Graceful fallback: AudioService returns silently, visual-only mode |
| SFX stub has no real audio | Expected | Low | MVP scope: real SFX in Phase 2 with Howler.js + audio files |
| Jest SSR issues with Next.js components | Medium | Medium | Use `jest-environment-jsdom`, mock `next/navigation` |
| Docker build fails on ARM Mac vs AMD64 VPS | Medium | Medium | Use `--platform linux/amd64` in Dockerfile, test cross-platform |
| Nginx SSL cert setup complexity | Low | Medium | Start with HTTP only, add SSL via certbot post-deploy |
| API tests require running PostgreSQL | Medium | Medium | Use Docker test database or Prisma mock adapter |
| Framer Motion bundle size | Low | Low | Use `motion` only for interactive animations |
| Touch events double-fire on hybrid devices | Low | Medium | Use `e.preventDefault()` on touch handlers or switch to pointer events |

## Security Considerations

- No new security surface from AudioService (output only, no microphone)
- Docker: non-root user in container, no exposed DB port in production
- Nginx: rate limiting on API routes (optional), security headers
- `.env` not copied into Docker image (use environment variables)
- API keys for AI endpoint stored as Docker secrets or environment variables
- Prisma seed script: no sensitive data in sticker definitions

## Next Steps

- Phase 2: Real audio files in `public/audio/`, Howler.js playback via AudioService
- Phase 2: Google TTS integration (enable GoogleTTSProvider)
- Phase 2: JWT authentication, multi-child support
- Phase 2: Content expansion (more worlds, more game types)
- Phase 2: CI/CD pipeline (GitHub Actions -> Docker Hub -> VPS auto-deploy)
