# Success Metrics

## MVP Definition of Done

MVP is complete when:
- [ ] All 5 mini-games playable end-to-end
- [ ] World map with level unlock progression works
- [ ] Reward system (stickers + stars + streak) persists across sessions
- [ ] Parent dashboard shows accurate stats
- [ ] Parent gate (PIN) protects parent area
- [ ] Audio works on iOS and Android
- [ ] QA checklist passes (see `docs/implementation/09_QA_TESTING_CHECKLIST.md`)
- [ ] Pixel-perfect vs design prototypes on 375px viewport

## Quality Gates

| Gate | Criteria |
|---|---|
| UI fidelity | All screens match design at 375px ± acceptable tolerance |
| Game logic | answer-validator unit test coverage ≥ 90% |
| Performance | TTI < 3s on mid-range Android (Lighthouse ≥ 75) |
| Audio | Audio plays on first tap after page load (iOS unlock) |
| Persistence | Progress survives browser close and reopen |

## Phase 1 KPIs (post-launch)

| KPI | Target |
|---|---|
| Session length | Avg 5–10 min (child does not force-quit) |
| 7-day retention | ≥ 40% of first-day users return on day 7 |
| Daily streak rate | ≥ 30% of active users maintain 3+ day streak |
| Crash rate | < 1% of sessions |

## Out of Scope for MVP Measurement

- Revenue / monetization
- User acquisition
- A/B testing difficulty curves
