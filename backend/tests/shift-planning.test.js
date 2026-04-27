import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import db from '../config/db.js';

/**
 * Tests d'intégration — Shifts Planning View
 * Vérifie les routes API utilisées par la vue planning 24h :
 * - données retournées avec start_time/end_time complets
 * - registered_count présent dans les réponses
 * - shifts couvrant plusieurs jours (soirées + nuit)
 * - shifts simultanés dans le même événement (détectables côté frontend)
 */
describe('Shifts API — Planning View (24h)', () => {
  let shiftNightId = null;
  let shiftOverlapAId = null;
  let shiftOverlapBId = null;

  afterAll(async () => {
    const ids = [shiftNightId, shiftOverlapAId, shiftOverlapBId].filter(Boolean);
    for (const id of ids) {
      await db.execute('DELETE FROM shift_registrations WHERE shift_id = ?', [id]);
      await db.execute('DELETE FROM shifts WHERE id = ?', [id]);
    }
    await db.end();
  });

  // ── Données de base ──────────────────────────────────────────────────────

  it('GET /shifts retourne registered_count pour chaque shift', async () => {
    const res = await request(app).get('/api/events/1/shifts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const shift = res.body.data[0];
      expect(shift).toHaveProperty('start_time');
      expect(shift).toHaveProperty('end_time');
      expect(shift).toHaveProperty('capacity');
      expect(shift).toHaveProperty('registered_count');
    }
  });

  // ── Shift nocturne (cross-midnight) ─────────────────────────────────────

  it('Crée un shift qui passe minuit (ex: Bar 22h → 02h)', async () => {
    const res = await request(app)
      .post('/api/events/1/shifts')
      .send({
        label: 'Bar nuit — test planning',
        start_time: '2024-12-14T22:00:00.000Z',
        end_time: '2024-12-15T02:00:00.000Z',
        capacity: 3
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeGreaterThan(0);
    shiftNightId = res.body.data.id;
  });

  it('Le shift nocturne est récupérable et ses horaires sont corrects', async () => {
    const res = await request(app).get('/api/events/1/shifts');
    expect(res.status).toBe(200);
    const nightShift = res.body.data.find(s => s.id === shiftNightId);
    expect(nightShift).toBeDefined();
    // La date de fin est bien le lendemain
    const start = new Date(nightShift.start_time);
    const end = new Date(nightShift.end_time);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
    expect(end.getDate()).not.toBe(start.getDate()); // jours différents
  });

  // ── Chevauchements (détectables par le planning) ─────────────────────────

  it('Crée 2 shifts simultanés le même jour (ex: 2 terrains en parallèle)', async () => {
    const [resA, resB] = await Promise.all([
      request(app).post('/api/events/1/shifts').send({
        label: 'Terrain A — test overlap',
        start_time: '2024-12-14T14:00:00.000Z',
        end_time: '2024-12-14T16:00:00.000Z',
        capacity: 3
      }),
      request(app).post('/api/events/1/shifts').send({
        label: 'Terrain B — test overlap',
        start_time: '2024-12-14T14:00:00.000Z',
        end_time: '2024-12-14T16:00:00.000Z',
        capacity: 3
      })
    ]);
    expect(resA.status).toBe(201);
    expect(resB.status).toBe(201);
    shiftOverlapAId = resA.body.data.id;
    shiftOverlapBId = resB.body.data.id;
  });

  it('Les 2 shifts simultanés sont retournés dans la liste', async () => {
    const res = await request(app).get('/api/events/1/shifts');
    const overlaps = res.body.data.filter(s =>
      s.id === shiftOverlapAId || s.id === shiftOverlapBId
    );
    expect(overlaps.length).toBe(2);
    // Les deux ont le même start_time (frontend les affiche côte à côte)
    expect(new Date(overlaps[0].start_time).getTime()).toBe(new Date(overlaps[1].start_time).getTime());
  });

  // ── Anti-conflit membre sur shifts qui se chevauchent ───────────────────

  it('Refuse l\'inscription si conflit horaire sur shifts simultanés', async () => {
    // Inscrire le membre 1 sur Terrain A
    await request(app)
      .post(`/api/events/1/shifts/${shiftOverlapAId}/register`)
      .send({ member_id: 2 });

    // Tenter d'inscrire le même membre sur Terrain B (même horaire = conflit)
    const res = await request(app)
      .post(`/api/events/1/shifts/${shiftOverlapBId}/register`)
      .send({ member_id: 2 });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/conflit|chevauchement/i);
  });

  // ── Statistiques planning ────────────────────────────────────────────────

  it('registered_count est correct après inscriptions', async () => {
    // Inscrire quelqu'un sur le shift nocturne
    await request(app)
      .post(`/api/events/1/shifts/${shiftNightId}/register`)
      .send({ member_id: 3 });

    const res = await request(app).get('/api/events/1/shifts');
    const nightShift = res.body.data.find(s => s.id === shiftNightId);
    expect(Number(nightShift.registered_count)).toBe(1);
  });
});
