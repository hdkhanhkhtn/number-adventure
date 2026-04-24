# RED FLAGS — Rationalization Detection

> **LOAD**: When red flag detected | **SOURCE**: Superpowers verification + systematic-debugging
> If you're thinking any of these, STOP immediately.

---

## VERIFICATION RED FLAGS

| Thought | Reality |
|---------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence is not evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter is not compiler |
| "Agent said success" | Verify independently |
| "Partial check is enough" | Partial proves nothing |
| "Tests probably pass" | VERIFY. Run them. Read output. |

---

## DEBUGGING RED FLAGS

| Thought | Reality |
|---------|---------|
| "Quick fix for now, investigate later" | Fix at root cause, not symptom |
| "Just try changing X and see" | Form hypothesis first |
| "It's probably X, let me fix that" | Probably is not verified |
| "I don't fully understand but this might work" | Understanding is prerequisite |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem |
| "Each fix reveals new problem" | Stop fixing symptoms |

---

## DELEGATION RED FLAGS

| Thought | Reality |
|---------|---------|
| "This is too simple for a sub-agent" | Complexity is deceptive. Delegate anyway. |
| "I'll just make a quick fix while I'm here" | Scope creep. Stick to the plan. |
| "I can skip the review for this" | Reviews catch what you miss. Never skip. |
| "This mock is good enough" | Mocks lie. Test against real interfaces. |
| "Let me just modify the plan slightly" | Prior deliverables are IMMUTABLE (L8). |
| "Save tokens by not delegating" | Token savings are not worth quality loss. |

---

## SKILL USAGE RED FLAGS (from Superpowers)

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

---

## COMPLETION RED FLAGS

| Thought | Reality |
|---------|---------|
| "Great! All done!" | Did you run verification? |
| "Perfect, moving on" | Evidence before satisfaction |
| "Should be complete" | "Should" is not verified |
| Using "probably", "seems to", "likely" | Uncertainty means verify |
| About to commit/push without verification | STOP. Verify first. |

---

## RESPONSE PROTOCOL

When you detect a red flag:
1. **STOP** — Do not continue current action
2. **IDENTIFY** — Which red flag was triggered
3. **CORRECT** — Apply the correct approach from "Reality" column
4. **PROCEED** — Continue with corrected approach
