import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import db from '../config/db.js';

describe('Budget API Integration Tests (Core)', () => {
    let testLineId = null;

    afterAll(async () => {
        await db.end(); // Ferme proprement le pool après les tests
    });

    it('devrait retourner les lignes de budget pour l\'événement 1', async () => {
        const res = await request(app).get('/api/budget-lines?eventId=1');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('ne devrait pas pouvoir créer une ligne de budget sans données valides', async () => {
        const res = await request(app)
            .post('/api/budget-lines')
            .send({}); // Manque event_id, type, etc.
            
        // Le Backend retourne un 400 ou une erreur SQL si non typé (souvent 400 catché)
        expect(res.status).toBeGreaterThanOrEqual(400); 
    });

    it('devrait créer une ligne de budget (dépense FSDIE) valide', async () => {
        const newDépense = {
            event_id: 1, // On suppose que l'event 1 existe via le seed
            type: 'EXPENSE',
            category: 'Logistique',
            label: 'Location Sono Test',
            forecast_amount: 500.00,
            is_fsdie_eligible: true,
            created_by: 1
        };

        const res = await request(app)
            .post('/api/budget-lines')
            .send(newDépense);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        
        testLineId = res.body.data.id;
        expect(testLineId).toBeGreaterThan(0);
    });

    it('devrait mettre à jour le montant réel (actual_amount) de la dépense', async () => {
        expect(testLineId).not.toBeNull();
        
        const res = await request(app)
            .put(`/api/budget-lines/${testLineId}`)
            .send({
                actual_amount: 480.00,
                updated_by: 1
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        
        // Optionnel : vérifier que req updated
        const fetchRes = await request(app).get('/api/budget-lines?eventId=1');
        const line = fetchRes.body.data.find(l => l.id === testLineId);
        // actual_amount est parfois retourné en string ('480.00') selon le driver mysql
        expect(Number(line.actual_amount)).toBe(480.00);
    });

    it('devrait supprimer la ligne de budget de test', async () => {
        const res = await request(app).delete(`/api/budget-lines/${testLineId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
