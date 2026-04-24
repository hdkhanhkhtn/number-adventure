import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sticker definitions mirroring src/data/game-config/sticker-defs.ts
// Schema: id (slug used as stable id), emoji, name, worldId, rarity
const STICKERS: Array<{ id: string; emoji: string; name: string; worldId: string; rarity: string }> = [
  // ── Number Garden ────────────────────────────────────────
  { id: 'ng-sunflower',   emoji: '🌻', name: 'Sunflower',       worldId: 'number-garden',   rarity: 'common' },
  { id: 'ng-seedling',    emoji: '🌱', name: 'Seedling',        worldId: 'number-garden',   rarity: 'common' },
  { id: 'ng-ladybug',     emoji: '🐞', name: 'Ladybug',         worldId: 'number-garden',   rarity: 'common' },
  { id: 'ng-butterfly',   emoji: '🦋', name: 'Butterfly',       worldId: 'number-garden',   rarity: 'rare'   },
  { id: 'ng-mushroom',    emoji: '🍄', name: 'Magic Mushroom',  worldId: 'number-garden',   rarity: 'rare'   },
  { id: 'ng-rainbow',     emoji: '🌈', name: 'Rainbow',         worldId: 'number-garden',   rarity: 'rare'   },
  { id: 'ng-sprout',      emoji: '🌿', name: 'Golden Sprout',   worldId: 'number-garden',   rarity: 'epic'   },
  { id: 'ng-star-seed',   emoji: '⭐', name: 'Star Seed',       worldId: 'number-garden',   rarity: 'epic'   },

  // ── Counting Castle ──────────────────────────────────────
  { id: 'cc-crown',       emoji: '👑', name: 'Crown',           worldId: 'counting-castle', rarity: 'common' },
  { id: 'cc-shield',      emoji: '🛡️', name: 'Shield',         worldId: 'counting-castle', rarity: 'common' },
  { id: 'cc-sword',       emoji: '⚔️', name: 'Sword',          worldId: 'counting-castle', rarity: 'common' },
  { id: 'cc-castle',      emoji: '🏰', name: 'Castle',          worldId: 'counting-castle', rarity: 'rare'   },
  { id: 'cc-knight',      emoji: '♟️', name: 'Knight',         worldId: 'counting-castle', rarity: 'rare'   },
  { id: 'cc-dragon',      emoji: '🐉', name: 'Friendly Dragon', worldId: 'counting-castle', rarity: 'epic'   },
  { id: 'cc-gem',         emoji: '💎', name: 'Gem',             worldId: 'counting-castle', rarity: 'epic'   },
  { id: 'cc-magic-wand',  emoji: '🪄', name: 'Magic Wand',     worldId: 'counting-castle', rarity: 'rare'   },

  // ── Even-Odd House ───────────────────────────────────────
  { id: 'eo-house',       emoji: '🏡', name: 'Cozy House',      worldId: 'even-odd-house',  rarity: 'common' },
  { id: 'eo-door',        emoji: '🚪', name: 'Magic Door',      worldId: 'even-odd-house',  rarity: 'common' },
  { id: 'eo-key',         emoji: '🗝️', name: 'Golden Key',     worldId: 'even-odd-house',  rarity: 'rare'   },
  { id: 'eo-mailbox',     emoji: '📬', name: 'Mailbox',         worldId: 'even-odd-house',  rarity: 'common' },
  { id: 'eo-owl',         emoji: '🦉', name: 'Wise Owl',        worldId: 'even-odd-house',  rarity: 'rare'   },
  { id: 'eo-moon',        emoji: '🌙', name: 'Moon',            worldId: 'even-odd-house',  rarity: 'rare'   },
  { id: 'eo-star-house',  emoji: '🌟', name: 'Star House',      worldId: 'even-odd-house',  rarity: 'epic'   },
  { id: 'eo-rainbow-key', emoji: '🔑', name: 'Rainbow Key',     worldId: 'even-odd-house',  rarity: 'epic'   },

  // ── Number Sequence ──────────────────────────────────────
  { id: 'ns-chain',       emoji: '🔗', name: 'Number Chain',    worldId: 'number-sequence', rarity: 'common' },
  { id: 'ns-arrows',      emoji: '↔️', name: 'Arrows',         worldId: 'number-sequence', rarity: 'common' },
  { id: 'ns-puzzle',      emoji: '🧩', name: 'Puzzle Piece',    worldId: 'number-sequence', rarity: 'rare'   },
  { id: 'ns-abacus',      emoji: '🧮', name: 'Abacus',          worldId: 'number-sequence', rarity: 'rare'   },
  { id: 'ns-infinity',    emoji: '♾️', name: 'Infinity',       worldId: 'number-sequence', rarity: 'epic'   },
  { id: 'ns-rocket',      emoji: '🚀', name: 'Number Rocket',   worldId: 'number-sequence', rarity: 'epic'   },
  { id: 'ns-telescope',   emoji: '🔭', name: 'Telescope',       worldId: 'number-sequence', rarity: 'rare'   },
  { id: 'ns-compass',     emoji: '🧭', name: 'Compass',         worldId: 'number-sequence', rarity: 'common' },

  // ── Math Kitchen ─────────────────────────────────────────
  { id: 'mk-chef-hat',    emoji: '👨‍🍳', name: 'Chef Hat',      worldId: 'math-kitchen',    rarity: 'common' },
  { id: 'mk-spatula',     emoji: '🍳', name: 'Spatula',         worldId: 'math-kitchen',    rarity: 'common' },
  { id: 'mk-cupcake',     emoji: '🧁', name: 'Cupcake',         worldId: 'math-kitchen',    rarity: 'common' },
  { id: 'mk-cookie',      emoji: '🍪', name: 'Math Cookie',     worldId: 'math-kitchen',    rarity: 'rare'   },
  { id: 'mk-pie',         emoji: '🥧', name: 'Number Pie',      worldId: 'math-kitchen',    rarity: 'rare'   },
  { id: 'mk-cake',        emoji: '🎂', name: 'Victory Cake',    worldId: 'math-kitchen',    rarity: 'epic'   },
  { id: 'mk-star-recipe', emoji: '📖', name: 'Star Recipe',     worldId: 'math-kitchen',    rarity: 'epic'   },
  { id: 'mk-trophy',      emoji: '🏆', name: 'Kitchen Trophy',  worldId: 'math-kitchen',    rarity: 'epic'   },
];

async function main(): Promise<void> {
  console.log(`Seeding ${STICKERS.length} stickers...`);

  for (const sticker of STICKERS) {
    await prisma.sticker.upsert({
      where: { id: sticker.id },
      update: { emoji: sticker.emoji, name: sticker.name, worldId: sticker.worldId, rarity: sticker.rarity },
      create: sticker,
    });
  }

  console.log(`Done — ${STICKERS.length} stickers seeded.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
