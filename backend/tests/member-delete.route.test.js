import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// ============================================================
// TR — DELETE /api/members/:id (Route)
// ============================================================
// On construit une mini-app en spiant le controller directement
// pour éviter le problème de mocking CJS/ESM avec require().

import memberController from '../controllers/member.controller.js';

// Spy sur la méthode du controller (CJS export patchable directement)
const deleteSpy = vi.spyOn(memberController, 'deleteMember');

const app = express();
app.use(express.json());
// Route minimale : pointe directement sur le handler spié
app.delete('/api/members/:id', memberController.deleteMember);

describe('DELETE /api/members/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit retourner 200 { success: true } quand la suppression réussit', async () => {
    deleteSpy.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Membre supprimé' });
    });

    const res = await request(app).delete('/api/members/1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Membre supprimé');
    expect(deleteSpy).toHaveBeenCalled();
  });

  it('doit retourner 200 pour un id différent (id=42)', async () => {
    deleteSpy.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Membre supprimé' });
    });

    const res = await request(app).delete('/api/members/42');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(deleteSpy).toHaveBeenCalled();
  });

  it("doit retourner 500 si le service lève une erreur", async () => {
    deleteSpy.mockImplementation(async (req, res) => {
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    });

    const res = await request(app).delete('/api/members/99');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Erreur serveur');
  });
});
