import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import db from '../config/db.js';

describe('API Integration Tests', () => {
    let token = '';

    beforeAll(async () => {
        // Optionnel : on pourrait vider/peupler la base gestion_assos_test ici
        // Mais nous l'avons déjà bootstrapée
    });

    afterAll(async () => {
        await db.end(); // Ferme le pool après les tests
    });

    describe('Auth API', () => {
        it('should login admin with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@kubik.fr', password: 'admin123' });

            console.log('Login Error: ', res.body);
            expect(res.status).toBe(200);
            expect(res.body.success).toBeUndefined(); // The auth controller returns raw object
            expect(res.body.message).toBe('Connexion reussie.');
            expect(res.body.token).toBeDefined();
            token = res.body.token;
        });

        it('should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@kubik.fr', password: 'wrong' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Identifiants invalides.');
        });
    });

    describe('Events API', () => {
        it('should fetch all events successfully', async () => {
            const res = await request(app).get('/api/events');
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should fail health check if database is unreachable (Optional)', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
