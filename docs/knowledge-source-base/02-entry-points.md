# Entry Points

## App Entry

```
app/layout.tsx          ← Root layout: providers wrap entire app
  └── app/page.tsx      ← Redirects to /child/home (default route)
```

## Route Groups

```
app/(child)/layout.tsx          ← Child shell (no parent nav, full-screen)
  ├── home/page.tsx             ← Child home screen
  ├── world/page.tsx            ← World map
  └── game/[gameId]/page.tsx    ← Game screen (dynamic segment)

app/(parent)/layout.tsx         ← Parent shell (back button, muted palette)
  ├── dashboard/page.tsx        ← Progress overview
  └── settings/page.tsx         ← Audio, difficulty, PIN management
```

## Provider Stack (app/layout.tsx)

```tsx
<AudioProvider>           // Howler.js singleton, audio state
  <ProgressProvider>      // localStorage sync, game progress
    <ThemeProvider>       // design tokens, dark/light (future)
      {children}
    </ThemeProvider>
  </ProgressProvider>
</AudioProvider>
```

## Key Hooks (entry into lib/)

| Hook | File | Used By |
|---|---|---|
| `useGame(gameId, levelId)` | `lib/hooks/useGame.ts` | game/[gameId]/page.tsx |
| `useProgress()` | `lib/hooks/useProgress.ts` | home, world, dashboard |
| `useAudio()` | `lib/hooks/useAudio.ts` | any interactive component |

## Dynamic Route: `/child/game/[gameId]`

`gameId` maps to a game type:

| gameId | Game Type |
|---|---|
| `hear-tap` | Hear & Tap |
| `number-order` | Number Order |
| `build-number` | Build the Number |
| `even-odd` | Even or Odd |
| `math-kitchen` | Math Kitchen |

The page reads `levelId` from query params: `/child/game/hear-tap?level=w1-l1`
