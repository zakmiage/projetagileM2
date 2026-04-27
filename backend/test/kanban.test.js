import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import db from '../config/db.js';

describe('Kanban API Integration Tests', () => {
  let testColId = null;
  let testCardId = null;

  afterAll(async () => {
    if (testColId) await db.execute('DELETE FROM kanban_columns WHERE id = ?', [testColId]);
    await db.end();
  });

  it('devrait retourner le kanban de l\'événement 1 (tableau vide ou non)', async () => {
    const res = await request(app).get('/api/events/1/kanban');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('devrait créer une colonne', async () => {
    const res = await request(app)
      .post('/api/events/1/kanban/columns')
      .send({ title: 'Test Colonne Vitest', color: '#6366f1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeGreaterThan(0);
    testColId = res.body.data.id;
  });

  it('devrait créer une carte dans la colonne', async () => {
    expect(testColId).not.toBeNull();
    const res = await request(app)
      .post(`/api/events/1/kanban/columns/${testColId}/cards`)
      .send({ title: 'Carte test Vitest', description: 'Description test', label: 'logistique' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    testCardId = res.body.data.id;
  });

  it('devrait déplacer la carte dans la même colonne', async () => {
    expect(testCardId).not.toBeNull();
    const res = await request(app)
      .put(`/api/events/1/kanban/cards/${testCardId}/move`)
      .send({ column_id: testColId, position: 0 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait modifier le titre de la carte', async () => {
    const res = await request(app)
      .put(`/api/events/1/kanban/cards/${testCardId}`)
      .send({ title: 'Carte modifiée', description: 'Update', label: 'achats', due_date: null });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('devrait supprimer la carte', async () => {
    const res = await request(app).delete(`/api/events/1/kanban/cards/${testCardId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    testCardId = null;
  });

  it('devrait supprimer la colonne', async () => {
    const res = await request(app).delete(`/api/events/1/kanban/columns/${testColId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    testColId = null;
  });
});
