import { describe, it, expect, vi, beforeEach } from 'vitest';
import BudgetLine from '../models/budget.model.js';

// ============================================================
// TU — BudgetLine.updateStatus (Model)
// ============================================================
// Injection de dépendance : on passe un mock db directement
// (évite le problème CJS/ESM avec vi.mock + require())

describe('BudgetLine.updateStatus', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = { execute: vi.fn() };
  });

  it('doit appeler db.execute avec APPROUVE et retourner true', async () => {
    mockDb.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await BudgetLine.updateStatus(1, 'APPROUVE', mockDb);

    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE budget_lines SET validation_status = ? WHERE id = ?',
      ['APPROUVE', 1]
    );
    expect(result).toBe(true);
  });

  it('doit appeler db.execute avec REFUSE et retourner true', async () => {
    mockDb.execute.mockResolvedValue([{ affectedRows: 1 }]);

    await BudgetLine.updateStatus(2, 'REFUSE', mockDb);

    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE budget_lines SET validation_status = ? WHERE id = ?',
      ['REFUSE', 2]
    );
  });

  it('doit appeler db.execute avec SOUMIS et retourner true', async () => {
    mockDb.execute.mockResolvedValue([{ affectedRows: 1 }]);

    await BudgetLine.updateStatus(3, 'SOUMIS', mockDb);

    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE budget_lines SET validation_status = ? WHERE id = ?',
      ['SOUMIS', 3]
    );
  });

  it('doit lever une erreur SANS appeler db si le statut est invalide', async () => {
    await expect(BudgetLine.updateStatus(1, 'INVALIDE', mockDb))
      .rejects
      .toThrow('Statut invalide');

    // Vérifier que la DB n'a pas été contactée
    expect(mockDb.execute).not.toHaveBeenCalled();
  });
});
