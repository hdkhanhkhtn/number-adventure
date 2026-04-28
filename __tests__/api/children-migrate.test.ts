/**
 * Tests for POST /api/children/migrate — guest-to-DB child migration
 * Mocks Prisma; tests route handler validation and DB logic.
 */
import { NextRequest } from 'next/server';

// Transaction proxy mock — all DB calls inside $transaction go through mockTx
const mockTx = {
  child: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  gameSession: {
    updateMany: jest.fn(),
  },
  childSticker: {
    updateMany: jest.fn(),
  },
  streak: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
};

// Mock Prisma before importing the route handler
jest.mock('@/lib/prisma', () => ({
  prisma: {
    parent: {
      findUnique: jest.fn(),
    },
    child: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { POST } from '@/app/api/children/migrate/route';
import { prisma } from '@/lib/prisma';

const mockParentFindUnique = prisma.parent.findUnique as jest.Mock;
const mockChildFindFirst = prisma.child.findFirst as jest.Mock;
const mockChildCreate = mockTx.child.create;

function makeRequest(body: unknown, parentIdCookie?: string): NextRequest {
  const url = new URL('http://localhost/api/children/migrate');
  const req = new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (parentIdCookie) {
    req.cookies.set('parentId', parentIdCookie);
  }
  return req;
}

beforeEach(() => {
  mockParentFindUnique.mockReset();
  mockChildFindFirst.mockReset();
  mockChildCreate.mockReset();
  mockTx.child.findFirst.mockReset();
  mockTx.gameSession.updateMany.mockReset();
  mockTx.childSticker.updateMany.mockReset();
  mockTx.streak.findUnique.mockReset();
  mockTx.streak.upsert.mockReset();
  mockTx.streak.delete.mockReset();

  // Default: $transaction executes the callback with the tx proxy
  (prisma.$transaction as jest.Mock).mockReset();
  (prisma.$transaction as jest.Mock).mockImplementation(
    async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
  );

  // Default: tx side-effect mocks return sensible no-ops unless overridden per test
  mockTx.child.findFirst.mockResolvedValue(null); // no existing child by default
  mockTx.gameSession.updateMany.mockResolvedValue({ count: 0 });
  mockTx.childSticker.updateMany.mockResolvedValue({ count: 0 });
  mockTx.streak.findUnique.mockResolvedValue(null);
});

describe('POST /api/children/migrate', () => {
  describe('authentication & authorization', () => {
    it('returns 401 when parentId cookie is missing', async () => {
      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe('Unauthorized');
    });

    it('returns 401 when parentId exists in cookie but parent not in DB', async () => {
      mockParentFindUnique.mockResolvedValueOnce(null);

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-fake-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.error).toBe('Unauthorized');
      expect(mockParentFindUnique).toHaveBeenCalledWith({
        where: { id: 'parent-fake-123' },
        select: { id: true },
      });
    });

    it('verifies parent existence before child operations', async () => {
      mockParentFindUnique.mockResolvedValueOnce(null);

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      await POST(req);

      // tx.child.findFirst and tx.child.create should NOT be called if parent doesn't exist
      expect(mockTx.child.findFirst).not.toHaveBeenCalled();
      expect(mockChildCreate).not.toHaveBeenCalled();
    });
  });

  describe('name validation', () => {
    beforeEach(() => {
      mockParentFindUnique.mockResolvedValue({ id: 'parent-123' });
    });

    it('returns 400 when name is missing', async () => {
      const req = makeRequest({ age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/name/i);
    });

    it('returns 400 when name is not a string', async () => {
      const req = makeRequest({ name: 123, age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/name/i);
    });

    it('returns 400 when name is empty string', async () => {
      const req = makeRequest({ name: '', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/name/i);
    });

    it('returns 400 when name is only whitespace', async () => {
      const req = makeRequest({ name: '   ', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/name/i);
    });

    it('returns 400 when name exceeds 50 characters', async () => {
      const longName = 'a'.repeat(51);
      const req = makeRequest({ name: longName, age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/name/i);
    });

    it('accepts name at exactly 50 characters', async () => {
      const exactName = 'a'.repeat(50);
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: exactName,
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: exactName, age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
    });

    it('trims name before validation and storage', async () => {
      const nameWithSpaces = '  Alice  ';
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: nameWithSpaces, age: 5, color: 'sage' }, 'parent-123');
      await POST(req);

      expect(mockChildCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Alice' }),
        }),
      );
    });
  });

  describe('age validation', () => {
    beforeEach(() => {
      mockParentFindUnique.mockResolvedValue({ id: 'parent-123' });
    });

    it('returns 400 when age is missing', async () => {
      const req = makeRequest({ name: 'Alice', color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/age/i);
    });

    it('returns 400 when age is not a number', async () => {
      const req = makeRequest({ name: 'Alice', age: '5', color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/age/i);
    });

    it('returns 400 when age is not an integer', async () => {
      const req = makeRequest({ name: 'Alice', age: 5.5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/age/i);
    });

    it('returns 400 when age is 0', async () => {
      const req = makeRequest({ name: 'Alice', age: 0, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/age/i);
    });

    it('returns 400 when age is negative', async () => {
      const req = makeRequest({ name: 'Alice', age: -5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/age/i);
    });

    it('returns 400 when age is 19 (exceeds max)', async () => {
      const req = makeRequest({ name: 'Alice', age: 19, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/age/i);
    });

    it('accepts age = 1 (minimum)', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 1,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 1, color: 'sage' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
    });

    it('accepts age = 18 (maximum)', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 18,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 18, color: 'sage' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
    });
  });

  describe('color validation', () => {
    beforeEach(() => {
      mockParentFindUnique.mockResolvedValue({ id: 'parent-123' });
    });

    it('accepts valid color "sun"', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'sun',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sun' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(mockChildCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ color: 'sun' }),
        }),
      );
    });

    it('accepts valid color "sage"', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
    });

    it('accepts valid color "coral"', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'coral',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'coral' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
    });

    it('accepts valid color "lavender"', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'lavender',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'lavender' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
    });

    it('accepts valid color "sky"', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'sky',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sky' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
    });

    it('defaults to "sage" for invalid color string', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'invalid-color' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(mockChildCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ color: 'sage' }),
        }),
      );
    });

    it('defaults to "sage" when color is missing', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 5 }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(mockChildCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ color: 'sage' }),
        }),
      );
    });

    it('defaults to "sage" for non-string color', async () => {
      mockChildFindFirst.mockResolvedValueOnce(null);
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 123 }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(mockChildCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ color: 'sage' }),
        }),
      );
    });
  });

  describe('idempotency & child creation', () => {
    beforeEach(() => {
      mockParentFindUnique.mockResolvedValue({ id: 'parent-123' });
    });

    it('returns 200 with existing child if same name already migrated', async () => {
      mockTx.child.findFirst.mockResolvedValueOnce({
        id: 'child-existing-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.child.id).toBe('child-existing-123');
      expect(body.child.name).toBe('Alice');
      // create should NOT be called if child exists
      expect(mockChildCreate).not.toHaveBeenCalled();
    });

    it('creates new child and returns 201 when name is unique', async () => {
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-new-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.child.id).toBe('child-new-123');
      expect(body.child.name).toBe('Alice');
      expect(mockChildCreate).toHaveBeenCalledWith({
        data: {
          parentId: 'parent-123',
          name: 'Alice',
          age: 5,
          color: 'sage',
        },
        select: { id: true, name: true, age: true, color: true },
      });
    });

    it('checks idempotency by querying findFirst with parentId + name', async () => {
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      await POST(req);

      // findFirst now runs inside $transaction (R2 fix — closes TOCTOU race)
      expect(mockTx.child.findFirst).toHaveBeenCalledWith({
        where: { parentId: 'parent-123', name: 'Alice' },
        select: { id: true, name: true, age: true, color: true },
      });
    });

    it('returns correct response shape: { child: { id, name, age, color } }', async () => {
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-abc-123',
        name: 'Bob',
        age: 7,
        color: 'coral',
      });

      const req = makeRequest({ name: 'Bob', age: 7, color: 'coral' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(body).toEqual({
        child: {
          id: 'child-abc-123',
          name: 'Bob',
          age: 7,
          color: 'coral',
        },
      });
    });
  });

  describe('guestId data copy', () => {
    beforeEach(() => {
      mockParentFindUnique.mockResolvedValue({ id: 'parent-123' });
      // mockTx.child.findFirst defaults to null (set in outer beforeEach)
      mockChildCreate.mockResolvedValueOnce({
        id: 'child-new-123',
        name: 'Alice',
        age: 5,
        color: 'sage',
      });
    });

    it('copies sessions, stickers, and streak when valid guestId provided', async () => {
      const guestStreak = {
        childId: 'guest_abc',
        currentStreak: 3,
        longestStreak: 5,
        lastPlayDate: new Date('2026-04-01'),
      };
      mockTx.streak.findUnique.mockResolvedValueOnce(guestStreak);

      const req = makeRequest(
        { name: 'Alice', age: 5, color: 'sage', guestId: 'guest_abc' },
        'parent-123',
      );
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(mockTx.gameSession.updateMany).toHaveBeenCalledWith({
        where: { childId: 'guest_abc' },
        data: { childId: 'child-new-123' },
      });
      expect(mockTx.childSticker.updateMany).toHaveBeenCalledWith({
        where: { childId: 'guest_abc' },
        data: { childId: 'child-new-123' },
      });
      expect(mockTx.streak.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { childId: 'child-new-123' },
          create: expect.objectContaining({ currentStreak: 3, longestStreak: 5 }),
        }),
      );
      expect(mockTx.streak.delete).toHaveBeenCalledWith({ where: { childId: 'guest_abc' } });
    });

    it('skips data copy when guestId is missing', async () => {
      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(mockTx.gameSession.updateMany).not.toHaveBeenCalled();
      expect(mockTx.childSticker.updateMany).not.toHaveBeenCalled();
      expect(mockTx.streak.findUnique).not.toHaveBeenCalled();
    });

    it('skips data copy when guestId does not start with guest_', async () => {
      const req = makeRequest(
        { name: 'Alice', age: 5, color: 'sage', guestId: 'real-child-id' },
        'parent-123',
      );
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(mockTx.gameSession.updateMany).not.toHaveBeenCalled();
    });

    it('creates new child without streak copy when guest has no streak', async () => {
      mockTx.streak.findUnique.mockResolvedValueOnce(null); // no streak for guest

      const req = makeRequest(
        { name: 'Alice', age: 5, color: 'sage', guestId: 'guest_no-streak' },
        'parent-123',
      );
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(mockTx.gameSession.updateMany).toHaveBeenCalled();
      expect(mockTx.streak.upsert).not.toHaveBeenCalled();
      expect(mockTx.streak.delete).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockParentFindUnique.mockResolvedValue({ id: 'parent-123' });
    });

    it('returns 500 when parent.findUnique throws', async () => {
      mockParentFindUnique.mockRejectedValueOnce(new Error('DB connection failed'));

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe('Internal server error');
    });

    it('returns 500 when child.findFirst throws', async () => {
      mockTx.child.findFirst.mockRejectedValueOnce(new Error('DB query failed'));

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe('Internal server error');
    });

    it('returns 500 when child.create throws', async () => {
      mockChildCreate.mockRejectedValueOnce(new Error('Constraint violation'));

      const req = makeRequest({ name: 'Alice', age: 5, color: 'sage' }, 'parent-123');
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe('Internal server error');
    });

    it('returns 500 when JSON parsing fails', async () => {
      const url = new URL('http://localhost/api/children/migrate');
      const req = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });
      req.cookies.set('parentId', 'parent-123');

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.error).toBe('Internal server error');
    });
  });
});
