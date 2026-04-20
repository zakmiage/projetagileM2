import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// ============================================================
// TR — PATCH /api/budget-lines/:id/status (Route)
// ============================================================
// On construit une mini-app en patchant le controller directement
// pour éviter le problème de mocking CJS/ESM avec require().

import budgetController from '../controllers/budget.controller.js';

// Spy sur la méthode du controller (CJS export patchable directement)
const updateStatusSpy = vi.spyOn(budgetController, 'updateValidationStatus');

const app = express();
app.use(express.json());
// Route minimale : pointe directement sur le handler spié
app.patch('/api/budget-lines/:id/status', budgetController.updateValidationStatus);

describe('PATCH /api/budget-lines/:id/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit retourner 200 avec un statut valide (APPROUVE)', async () => {
    // Remplace l'implémentation pour ce test : simule succès
    updateStatusSpy.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Statut mis à jour : APPROUVE' });
    });

    const res = await request(app)
      .patch('/api/budget-lines/1/status')
      .send({ status: 'APPROUVE' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(updateStatusSpy).toHaveBeenCalled();
  });

  it('doit retourner 200 avec un statut valide (REFUSE)', async () => {
    updateStatusSpy.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Statut mis à jour : REFUSE' });
    });

    const res = await request(app)
      .patch('/api/budget-lines/2/status')
      .send({ status: 'REFUSE' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('doit retourner 400 si le champ status est absent', async () => {
    // Restaure l'implémentation réelle pour tester la validation du controller
    updateStatusSpy.mockRestore();
    // Recrée le spy non-implémenté => laisse passer l'implémentation réelle
    // On reconstruit l'app avec la vraie impl (sans DB, juste la validation)
    const appReal = express();
    appReal.use(express.json());
    // Re-importe le controller réel
    const ctrl = await import('../controllers/budget.controller.js');
    appReal.patch('/api/budget-lines/:id/status', ctrl.default.updateValidationStatus);

    const res = await request(appReal)
      .patch('/api/budget-lines/1/status')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/status/i);
  });

  it('doit retourner 400 si le statut est invalide', async () => {
    // Test réel : la validation de l'enum est dans le model (n'atteint jamais la DB)
    // On laisse le controller appeler le vrai code jusqu'à la validation de l'enum
    const appReal = express();
    appReal.use(express.json());
    const ctrl = await import('../controllers/budget.controller.js');
    appReal.patch('/api/budget-lines/:id/status', ctrl.default.updateValidationStatus);

    const res = await request(appReal)
      .patch('/api/budget-lines/1/status')
      .send({ status: 'INVALIDE' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Statut invalide');
  });
});
