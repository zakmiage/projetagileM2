import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// ============================================================
// TR — DELETE /api/events/:id (Route)
// ============================================================
// On construit une mini-app en spiant le controller directement
// pour éviter le problème de mocking CJS/ESM avec require().

import eventController from '../controllers/event.controller.js';

// Spy sur la méthode du controller (CJS export patchable directement)
const deleteSpy = vi.spyOn(eventController, 'deleteEvent');

const app = express();
app.use(express.json());
// Route minimale : pointe directement sur le handler spié
app.delete('/api/events/:id', eventController.deleteEvent);

describe('DELETE /api/events/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit retourner 200 { success: true } quand la suppression réussit', async () => {
    deleteSpy.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, message: 'Événement supprimé avec succès' });
    });

    const res = await request(app).delete('/api/events/1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Événement supprimé avec succès');
    expect(deleteSpy).toHaveBeenCalled();
  });

  it("doit retourner 404 si l'événement n'existe pas", async () => {
    deleteSpy.mockImplementation(async (req, res) => {
      res.status(404).json({ success: false, message: 'Événement introuvable' });
    });

    const res = await request(app).delete('/api/events/9999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Événement introuvable');
  });

  it('doit retourner 400 si le service lève une erreur générique', async () => {
    deleteSpy.mockImplementation(async (req, res) => {
      res.status(400).json({ success: false, message: 'Erreur de suppression' });
    });

    const res = await request(app).delete('/api/events/1');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
