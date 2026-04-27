import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import db from '../config/db.js';

describe('Shifts API Integration Tests', () => {
  let testShiftId = null;

  afterAll(async () => {
    if (testShiftId) {
      await db.execute('DELETE FROM shifts WHERE id = ?', [testShiftId]);
    }
    await db.end();
  });

  it('devrait retourner les shifts de l\'événement 1', async () => {
    const res = await request(app).get('/api/events/1/shifts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('devrait créer un shift valide', async () => {
    const res = await request(app)
      .post('/api/events/1/shifts')
      .send({
        label: 'Test Créneau Vitest',
        start_time: '2025-12-01T08:00:00.000Z',
        end_time: '2025-12-01T12:00:00.000Z',
        capacity: 5
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeGreaterThan(0);
    testShiftId = res.body.data.id;
  });

  it('devrait refuser une inscription si capacité atteinte (shift capacity=0)', async () => {
    // Créer un shift à capacité 0
    const createRes = await request(app)
      .post('/api/events/1/shifts')
      .send({ label: 'Full Shift', start_time: '2025-12-02T08:00:00.000Z', end_time: '2025-12-02T10:00:00.000Z', capacity: 0 });
    const fullShiftId = createRes.body.data.id;

    const res = await request(app)
      .post(`/api/events/1/shifts/${fullShiftId}/register`)
      .send({ member_id: 1 });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);

    // Cleanup
    await db.execute('DELETE FROM shifts WHERE id = ?', [fullShiftId]);
  });

  it('devrait refuser une inscription en doublon sur le même shift', async () => {
    // Inscrire une première fois
    await request(app)
      .post(`/api/events/1/shifts/${testShiftId}/register`)
      .send({ member_id: 1 });

    // Réinscrire le même membre
    const res = await request(app)
      .post(`/api/events/1/shifts/${testShiftId}/register`)
      .send({ member_id: 1 });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);

    // Cleanup inscription
    await db.execute('DELETE FROM shift_registrations WHERE shift_id = ? AND member_id = 1', [testShiftId]);
  });

  it('devrait récupérer les inscrits d\'un shift', async () => {
    const res = await request(app).get(`/api/events/1/shifts/${testShiftId}/registrations`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('devrait supprimer le shift de test', async () => {
    const res = await request(app).delete(`/api/events/1/shifts/${testShiftId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    testShiftId = null;
  });
});
