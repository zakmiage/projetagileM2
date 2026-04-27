import { describe, it, expect, vi, beforeEach } from 'vitest';
import Member from '../models/member.model.js';

// ============================================================
// TU — Member.delete (Model)
// ============================================================
// Injection de dépendance : on passe un mock db directement
// (évite le problème CJS/ESM avec vi.mock + require())

describe('Member.delete', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = { execute: vi.fn() };
  });

  it('doit appeler db.execute avec la bonne requête SQL et retourner true', async () => {
    mockDb.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await Member.delete(42, mockDb);

    expect(mockDb.execute).toHaveBeenCalledWith(
      'DELETE FROM members WHERE id = ?',
      [42]
    );
    expect(result).toBe(true);
  });

  it('doit appeler db.execute avec un id différent', async () => {
    mockDb.execute.mockResolvedValue([{ affectedRows: 1 }]);

    await Member.delete(7, mockDb);

    expect(mockDb.execute).toHaveBeenCalledWith(
      'DELETE FROM members WHERE id = ?',
      [7]
    );
  });

  it('doit propager une erreur si db.execute rejette', async () => {
    mockDb.execute.mockRejectedValue(new Error('DB connection lost'));

    await expect(Member.delete(1, mockDb)).rejects.toThrow('DB connection lost');
  });
});
