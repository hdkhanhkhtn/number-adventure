# Game Types: Build the Number and Even or Odd

## 3. Build the Number (Place Value Understanding)

**Learning Goal:** Understand multi-digit number structure using place value (tens and ones, later hundreds).

**Concept:** Target number shown at top (e.g., 24) → child drags tens and ones blocks to build it.

**Core Interaction:**
1. Target number displayed prominently: `24`
2. Draggable digit or block tiles below: `[2] [4] [1] [3]`
3. Two drop zones or build area (for tens and ones)
4. Child drags digits into slots in correct order
5. Submit or auto-check → feedback

**Montessori-Inspired Approach:**
- Visual tens/ones distinction via block design
- Soft color coding for each place value
- Counting support to help child verify

**Difficulty Variants:**
- **Easy:** Single-digit (1-digit) or intro tens/ones
- **Medium:** 2-digit numbers (tens and ones)
- **Hard:** 3-digit numbers (hundreds, tens, ones)

**Interaction Variants:**
- Read the written number and build
- Build based on audio prompt
- Match built blocks to written number
- Guided hint overlay: "2 tens and 4 ones"

**Design Notes:**
- Highly visual, Montessori-inspired but playful
- Blocks easy to drag, with satisfying snap-to-slot
- Clear visual difference between tens and ones
- Simple, uncluttered interface
- Encouraging hint messages

**Config:**
```typescript
{ 
  type: "build-number",
  target: 23,
  placeValues: ["tens", "ones"],  // easy: ones only, hard: [hundreds, tens, ones]
  difficulty: "medium"
}
```

---

## 4. Even or Odd (Number Classification)

**Learning Goal:** Introduce the concept of even and odd numbers in a visual, intuitive way (pairing / grouping).

**Concept:** Number appears on screen → child sorts it into Even House or Odd House.

**Two Pedagogical Modes:**

**Mode 1 — Visual Pairing Intro:**
- Objects (apples, stars, socks) shown
- Child sees: even = objects pair perfectly; odd = one left over
- Builds intuitive understanding before abstract concept

**Mode 2 — Number Sorting:**
- Written numbers appear
- Two large destination areas (Even House & Odd House)
- Child taps or drags number into correct house
- Correct → number flies into house + celebratory animation
- Wrong → bounces back + encouragement to try again

**Design & UI:**
- Two cute, large, visually distinct houses/baskets/gates
- Very clear color distinction per category
- Large draggable number cards
- Friendly mascot explanation
- Low cognitive load; no text clutter
- Delightful visual metaphor (houses, bridges, baskets, doors)

**Difficulty Variants:**
- **Easy:** range 1–10
- **Medium:** range 1–20
- **Hard:** range 1–50

**States to Show:**
- Intro teaching state (pairing explanation)
- Default drag state
- Correct drop (animation)
- Incorrect drop (bounce back)
- Round complete celebration

**Config:**
```typescript
{ 
  type: "even-odd",
  range: [1, 10],     // easy: 1-10, medium: 1-20, hard: 1-50
  showPairingHint: true,
  difficulty: "easy"
}
```
