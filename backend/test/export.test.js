import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import db from '../config/db.js';

describe('Export PDF API Integration Tests', () => {
  afterAll(async () => {
    await db.end();
  });

  it('GET /api/export/events/1/invoices — retourne 200 ou 404 selon PJ présentes', async () => {
    const res = await request(app).get('/api/export/events/1/invoices');
    // 200 = PDF généré, 404 = aucune PJ (les deux sont valides selon le jeu de données)
    expect([200, 404]).toContain(res.status);
  });

  it('GET /api/export/events/1/fsdie — retourne 200 ou 400 selon lignes éligibles', async () => {
    const res = await request(app).get('/api/export/events/1/fsdie');
    expect([200, 400]).toContain(res.status);
  });

  it('GET /api/export/events/9999/invoices — retourne 404 pour événement inexistant', async () => {
    const res = await request(app).get('/api/export/events/9999/invoices');
    expect(res.status).toBe(404);
  });

  it('GET /api/export/events/9999/fsdie — retourne 404 pour événement inexistant', async () => {
    const res = await request(app).get('/api/export/events/9999/fsdie');
    expect(res.status).toBe(404);
  });

  it('POST /api/export/budget — retourne un blob xlsx valide', async () => {
    const res = await request(app)
      .post('/api/export/budget')
      .send({
        lines: [
          { type: 'EXPENSE', category: 'Logistique', label: 'Test', forecast_amount: 100, is_fsdie_eligible: true },
          { type: 'REVENUE', category: 'Subvention', label: 'FSDIE', forecast_amount: 200 }
        ],
        fsdieOnly: false
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml');
  });
});
