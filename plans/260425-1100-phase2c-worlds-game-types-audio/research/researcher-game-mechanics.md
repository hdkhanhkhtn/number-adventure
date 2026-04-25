# Research Report: Game Mechanics — Counting Objects, Number Writing, World Content Strategy

## Executive Summary
Emoji arrays are simplest for counting games; tap-sequence is the right approach for number writing in a web app (no canvas complexity); curriculum evidence confirms the proposed difficulty ranges and engine reuse strategy.

---

## Topic 1 — Counting Objects Game

### Payload representation: Emoji vs SVG vs sprites vs canvas

**Recommendation: Unicode emoji rendered as `<span>` / flex grid.**

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| Unicode emoji (span) | Zero deps, no network, trivial layout | Cross-platform glyph variance (Apple vs Android) | **Best for simplicity** |
| Twemoji / react-easy-emoji | Consistent glyphs via img/SVG, npm pkg | Extra request or bundle weight | Good fallback if glyph variance matters |
| Inline SVG | DOM-resident, animatable, no network | Each icon = DOM node, authoring cost high | Overkill for static counters |
| CSS sprites | One image, fast | Authoring complexity, not scalable | Skip |
| Canvas | Best perf at 100+ items | Accessibility zero, touch hit-testing hard | Skip |

For 1–20 items, a CSS flex-wrap grid of `<span>` emoji has negligible render cost. 20 emoji DOM nodes is trivial on any 2020+ mobile device. No performance concern.
- Source: [react-easy-emoji npm](https://www.npmjs.com/package/react-easy-emoji); [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- Confidence: High

### Number range by difficulty (ages 4–7)

| Difficulty | Range | Age target | Basis |
|---|---|---|---|
| Easy | 1–5 | 4–5 yr (pre-K) | Pre-K subitizing ceiling |
| Medium | 1–10 | 5–6 yr (K) | Common Core K.CC — count to 10 |
| Hard | 1–20 | 6–7 yr (Gr 1) | Common Core 1.OA — numbers to 20 |

**The proposed ranges are correct.** Common Core K domain requires counting to 20 by end of kindergarten; 1–20 hard tier is appropriate for top of age band.
- Source: [CT Common Core K-2 Domain Progressions PDF](https://portal.ct.gov/-/media/SDE/CT-Core-Standards/2014/08/CCSS_math_K_2_Domain_Progressions.pdf); [Brighterly K Skills](https://brighterly.com/blog/kindergarten-math-skills/)
- Confidence: High

### Distractor strategy

- **4 answer choices** is standard for this age band (reduces cognitive load vs 6, still meaningful choice).
- Use **±1 / ±2 distractors** (not random) — randomness can accidentally produce near-correct answers; ±1/±2 tests number sense specifically.
- On wrong answer: do NOT eliminate choice; shuffle positions and allow retry (keeps engagement, avoids shame).
- Source: [Frontiers — Game-based preschool math assessment](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1337716/full); [Journal of Numerical Cognition](https://jnc.psychopen.eu/index.php/jnc/article/view/14249/14249.html)
- Confidence: High

---

## Topic 2 — Number Writing Game (No Native App)

### Canvas approach: feasibility

HTML5 Canvas + Pointer Events is technically feasible on iOS Safari 13+ and Android Chrome 70+. Key implementation notes:
- Use `pointer events` (not touch events) — single API covers touch + stylus + mouse.
- Must call `e.preventDefault()` on `pointerdown` inside canvas to stop iOS scroll hijack.
- `react-konva` wraps canvas with React bindings including `onTouchStart/Move/End`.
- Source: [web.dev multi-touch](https://web.dev/articles/mobile-touch); [Konva mobile events](https://konvajs.org/docs/events/Mobile_Events.html); [Apple Canvas touch guide](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingMouseandTouchControlstoCanvas/AddingMouseandTouchControlstoCanvas.html)
- Confidence: High (established APIs, no 2025 breaking changes)

### Approach comparison for ages 4–7

| Approach | Description | Fit for 4-7 yr / 375px |
|---|---|---|
| Canvas free-draw | Child draws digit freely, app validates stroke | Hard: digit recognition needs ML or complex heuristics; fat fingers produce poor strokes |
| **Tap-sequence (dot connect)** | Numbered dots appear on digit path; child taps 1→2→3→N in order | **Best**: large tap targets (48px+), no stroke accuracy needed, clear affordance |
| Stroke-match / trace | Ghost digit shown, child overlays with finger, app checks path delta | Medium: feasible with canvas+pointer events, but fat-finger drift causes false failures — frustrating |

**Recommendation: Tap-sequence (dot connect).**
- Render digit as SVG path; overlay 5–8 numbered circle dots along the path.
- Child taps dots in order; each correct tap animates/highlights.
- No ML, no canvas, no stroke validation — pure React state machine.
- Touch targets are large circles (min 56px diameter), well above 48px WCAG guideline.
- No existing React library needed — implement as a small state component.
- Source: [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events); [bencentra canvas touch](https://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html)
- Confidence: High (engineering judgment + age-appropriate UX reasoning)

---

## Topic 3 — World Content Strategy (Ages 4–7)

### World 4: Math Kitchen — addition/subtraction story problems

Kindergarten (5–6 yr): solve addition/subtraction within **10** using concrete objects or drawings.
Grade 1 (6–7 yr): fluency within **20** (Common Core 1.OA.6).

| Difficulty | Operation | Range | Visual strategy |
|---|---|---|---|
| Easy | Add/subtract | 0–5 | 1–5 food objects, combine/remove |
| Medium | Add/subtract | 0–10 | 2 groups of food items |
| Hard | Add/subtract | 0–20 | Two-step or larger groups |

**Engine reuse:** Math Kitchen maps cleanly to the existing `add-take` engine (addition + subtraction question generation). Extend with a "story wrapper" (visual scene + narrative text) rather than building a new engine. Reuse `add-take` config with `maxResult` param per difficulty.
- Source: [SplashLearn K curriculum](https://www.splashlearn.com/blog/kindergarten-math-curriculum/); [ThirdSpaceLearning addition guide](https://thirdspacelearning.com/us/blog/teaching-addition-subtraction-elementary/); [CT CCSS K-2](https://portal.ct.gov/-/media/SDE/CT-Core-Standards/2014/08/CCSS_math_K_2_Domain_Progressions.pdf)
- Confidence: High

### World 5: Big Number Castle — place value, two-digit numbers

Kindergarten (5–6 yr): begin place value concept (21 > 12); understand tens and ones via blocks.
Grade 1 (6–7 yr): understand tens/ones in two-digit numbers; read and write numbers to 120.

Two-digit place value is **age-appropriate at the top of the 4–7 band (6–7 yr)** — it is standard Grade 1 content, not too advanced. Not appropriate for easy difficulty (4–5 yr).

| Difficulty | Content | Age |
|---|---|---|
| Easy | Tens only (10, 20, 30…) | 5–6 yr |
| Medium | Tens + ones, numbers 11–50 | 6–7 yr |
| Hard | Full 11–99 decomposition | 7 yr |

**Engine reuse:** World 5 maps to the existing `build-number` engine (compose number from parts). Extend with a "castle blocks" visual skin (towers = tens, bricks = ones). No new engine needed.
- Source: [Brighterly K skills](https://brighterly.com/blog/kindergarten-math-skills/); [KIBSD K-5 Math Curriculum](https://www.kibsd.org/wp-content/uploads/2024/11/K-5-Math-Curriculum-2021.pdf); [KomodoMath K skills](https://komodomath.com/us/blog/kindergarten-math-skills)
- Confidence: High

---

## Sources
1. [react-easy-emoji — npm](https://www.npmjs.com/package/react-easy-emoji)
2. [Frontiers — Game-based preschool math assessment (2024)](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1337716/full)
3. [Journal of Numerical Cognition — Digital game assessment](https://jnc.psychopen.eu/index.php/jnc/article/view/14249/14249.html)
4. [CT CCSS K-2 Domain Progressions (Common Core)](https://portal.ct.gov/-/media/SDE/CT-Core-Standards/2014/08/CCSS_math_K_2_Domain_Progressions.pdf)
5. [Brighterly — Kindergarten Math Skills](https://brighterly.com/blog/kindergarten-math-skills/)
6. [SplashLearn — Kindergarten Math Curriculum](https://www.splashlearn.com/blog/kindergarten-math-curriculum/)
7. [ThirdSpaceLearning — Teaching Addition & Subtraction](https://thirdspacelearning.com/us/blog/teaching-addition-subtraction-elementary/)
8. [KomodoMath — Kindergarten Math Skills](https://komodomath.com/us/blog/kindergarten-math-skills)
9. [KIBSD K-5 Math Curriculum (reviewed 2024)](https://www.kibsd.org/wp-content/uploads/2024/11/K-5-Math-Curriculum-2021.pdf)
10. [web.dev — Multi-touch web development](https://web.dev/articles/mobile-touch)
11. [Konva — Mobile Touch Events](https://konvajs.org/docs/events/Mobile_Events.html)
12. [MDN — Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
13. [Apple Developer — Canvas Touch Controls](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingMouseandTouchControlstoCanvas/AddingMouseandTouchControlstoCanvas.html)

---

## Unresolved Questions
1. **Emoji glyph variance**: Does the product require pixel-identical emoji across iOS/Android? If yes, adopt Twemoji via react-easy-emoji (adds ~20 KB). If no, native Unicode spans are fine.
2. **Number Writing — digit set**: Which digits are in scope for World N? (0–9 all, or subset?) Affects how many dot-path SVGs must be authored.
3. **World 5 easy difficulty**: "Tens only (10,20,30…)" may feel too easy to be a distinct difficulty — confirm with UX whether to merge easy/medium or add a visual counting-rods sub-mechanic.
4. **Math Kitchen story problem copy**: Who authors the Vietnamese-language story text? (Microcopy Guide scope or content team?)
5. **`add-take` engine max result param**: Confirm current engine config API supports `maxResult` injection per game session, or if that requires engine modification.
