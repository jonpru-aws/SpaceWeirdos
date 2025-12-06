import { describe, it, expect, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { DataRepository } from '../src/backend/services/DataRepository';
import { createWarbandRouter } from '../src/backend/routes/warbandRoutes';
import { Warband, Weirdo } from '../src/backend/models/types';

/**
 * Integration tests for Warband API endpoints
 * Tests all REST endpoints for warband management
 */
describe('Warband API Routes', () => {
  let app: Express;
  let repository: DataRepository;

  beforeEach(() => {
    // Create fresh app and repository for each test
    app = express();
    app.use(express.json());
    
    // Use in-memory repository without file persistence for tests
    repository = new DataRepository('test-warbands.json', false);
    
    const router = createWarbandRouter(repository);
    app.use('/api', router);
  });

  describe('POST /api/warbands', () => {
    it('should create a new warband with valid data', async () => {
      const response = await request(app)
        .post('/api/warbands')
        .send({
          name: 'Test Warband',
          pointLimit: 75,
          ability: 'Cyborgs'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Warband');
      expect(response.body.pointLimit).toBe(75);
      expect(response.body.ability).toBe('Cyborgs');
      expect(response.body.totalCost).toBe(0);
      expect(response.body.weirdos).toEqual([]);
    });

    it('should reject warband creation with missing name', async () => {
      const response = await request(app)
        .post('/api/warbands')
        .send({
          pointLimit: 75,
          ability: 'Cyborgs'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject warband creation with invalid point limit', async () => {
      const response = await request(app)
        .post('/api/warbands')
        .send({
          name: 'Test Warband',
          pointLimit: 100,
          ability: 'Cyborgs'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid point limit');
    });

    it('should accept warband creation with null ability', async () => {
      const response = await request(app)
        .post('/api/warbands')
        .send({
          name: 'Test Warband',
          pointLimit: 75,
          ability: null
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.ability).toBe(null);
    });
  });

  describe('GET /api/warbands', () => {
    it('should return empty array when no warbands exist', async () => {
      const response = await request(app)
        .get('/api/warbands');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all warbands', async () => {
      // Create two warbands
      await request(app)
        .post('/api/warbands')
        .send({ name: 'Warband 1', pointLimit: 75, ability: 'Cyborgs' });
      
      await request(app)
        .post('/api/warbands')
        .send({ name: 'Warband 2', pointLimit: 125, ability: 'Mutants' });

      const response = await request(app)
        .get('/api/warbands');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Warband 1');
      expect(response.body[1].name).toBe('Warband 2');
    });
  });

  describe('GET /api/warbands/:id', () => {
    it('should return a specific warband by ID', async () => {
      const createResponse = await request(app)
        .post('/api/warbands')
        .send({ name: 'Test Warband', pointLimit: 75, ability: 'Cyborgs' });

      const warbandId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/warbands/${warbandId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(warbandId);
      expect(response.body.name).toBe('Test Warband');
    });

    it('should return 404 for non-existent warband', async () => {
      const response = await request(app)
        .get('/api/warbands/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/warbands/:id', () => {
    it('should update an existing warband', async () => {
      const createResponse = await request(app)
        .post('/api/warbands')
        .send({ name: 'Original Name', pointLimit: 75, ability: 'Cyborgs' });

      const warbandId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/warbands/${warbandId}`)
        .send({
          name: 'Updated Name',
          pointLimit: 125,
          ability: 'Mutants'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.pointLimit).toBe(125);
      expect(response.body.ability).toBe('Mutants');
    });

    it('should return 404 for non-existent warband', async () => {
      const response = await request(app)
        .put('/api/warbands/non-existent-id')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/warbands/:id', () => {
    it('should delete an existing warband', async () => {
      const createResponse = await request(app)
        .post('/api/warbands')
        .send({ name: 'Test Warband', pointLimit: 75, ability: 'Cyborgs' });

      const warbandId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/api/warbands/${warbandId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify warband is deleted
      const getResponse = await request(app)
        .get(`/api/warbands/${warbandId}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent warband', async () => {
      const response = await request(app)
        .delete('/api/warbands/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/warbands/:id/weirdos', () => {
    it('should add a weirdo to a warband', async () => {
      const createResponse = await request(app)
        .post('/api/warbands')
        .send({ name: 'Test Warband', pointLimit: 75, ability: 'Cyborgs' });

      const warbandId = createResponse.body.id;

      const weirdo: Partial<Weirdo> = {
        id: 'weirdo-1',
        name: 'Test Leader',
        type: 'leader',
        attributes: {
          speed: 2,
          defense: '2d6',
          firepower: 'None',
          prowess: '2d6',
          willpower: '2d6'
        },
        closeCombatWeapons: [{
          id: 'weapon-1',
          name: 'Unarmed',
          type: 'close',
          baseCost: 0,
          maxActions: 2,
          notes: ''
        }],
        rangedWeapons: [],
        equipment: [],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 0
      };

      const response = await request(app)
        .post(`/api/warbands/${warbandId}/weirdos`)
        .send(weirdo);

      expect(response.status).toBe(201);
      expect(response.body.weirdos).toHaveLength(1);
      expect(response.body.weirdos[0].name).toBe('Test Leader');
      expect(response.body.totalCost).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent warband', async () => {
      const weirdo: Partial<Weirdo> = {
        id: 'weirdo-1',
        name: 'Test Leader',
        type: 'leader'
      };

      const response = await request(app)
        .post('/api/warbands/non-existent-id/weirdos')
        .send(weirdo);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/warbands/:id/weirdos/:weirdoId', () => {
    it('should update a weirdo in a warband', async () => {
      // Create warband
      const createResponse = await request(app)
        .post('/api/warbands')
        .send({ name: 'Test Warband', pointLimit: 75, ability: 'Cyborgs' });

      const warbandId = createResponse.body.id;

      // Add weirdo
      const weirdo: Partial<Weirdo> = {
        id: 'weirdo-1',
        name: 'Original Name',
        type: 'leader',
        attributes: {
          speed: 1,
          defense: '2d6',
          firepower: 'None',
          prowess: '2d6',
          willpower: '2d6'
        },
        closeCombatWeapons: [{
          id: 'weapon-1',
          name: 'Unarmed',
          type: 'close',
          baseCost: 0,
          maxActions: 2,
          notes: ''
        }],
        rangedWeapons: [],
        equipment: [],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 0
      };

      await request(app)
        .post(`/api/warbands/${warbandId}/weirdos`)
        .send(weirdo);

      // Update weirdo
      const updatedWeirdo = {
        ...weirdo,
        name: 'Updated Name',
        attributes: {
          speed: 2,
          defense: '2d8',
          firepower: 'None',
          prowess: '2d8',
          willpower: '2d8'
        }
      };

      const response = await request(app)
        .put(`/api/warbands/${warbandId}/weirdos/weirdo-1`)
        .send(updatedWeirdo);

      expect(response.status).toBe(200);
      expect(response.body.weirdos[0].name).toBe('Updated Name');
      expect(response.body.weirdos[0].attributes.speed).toBe(2);
    });

    it('should return 404 for non-existent weirdo', async () => {
      const createResponse = await request(app)
        .post('/api/warbands')
        .send({ name: 'Test Warband', pointLimit: 75, ability: 'Cyborgs' });

      const warbandId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/warbands/${warbandId}/weirdos/non-existent-id`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/warbands/:id/weirdos/:weirdoId', () => {
    it('should remove a weirdo from a warband', async () => {
      // Create warband
      const createResponse = await request(app)
        .post('/api/warbands')
        .send({ name: 'Test Warband', pointLimit: 75, ability: 'Cyborgs' });

      const warbandId = createResponse.body.id;

      // Add weirdo
      const weirdo: Partial<Weirdo> = {
        id: 'weirdo-1',
        name: 'Test Leader',
        type: 'leader',
        attributes: {
          speed: 1,
          defense: '2d6',
          firepower: 'None',
          prowess: '2d6',
          willpower: '2d6'
        },
        closeCombatWeapons: [{
          id: 'weapon-1',
          name: 'Unarmed',
          type: 'close',
          baseCost: 0,
          maxActions: 2,
          notes: ''
        }],
        rangedWeapons: [],
        equipment: [],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 0
      };

      await request(app)
        .post(`/api/warbands/${warbandId}/weirdos`)
        .send(weirdo);

      // Remove weirdo
      const response = await request(app)
        .delete(`/api/warbands/${warbandId}/weirdos/weirdo-1`);

      expect(response.status).toBe(200);
      expect(response.body.weirdos).toHaveLength(0);
      expect(response.body.totalCost).toBe(0);
    });

    it('should return 404 for non-existent weirdo', async () => {
      const createResponse = await request(app)
        .post('/api/warbands')
        .send({ name: 'Test Warband', pointLimit: 75, ability: 'Cyborgs' });

      const warbandId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/warbands/${warbandId}/weirdos/non-existent-id`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/calculate-cost', () => {
    it('should calculate cost for a weirdo', async () => {
      const weirdo: Partial<Weirdo> = {
        id: 'weirdo-1',
        name: 'Test Leader',
        type: 'leader',
        attributes: {
          speed: 2,
          defense: '2d8',
          firepower: 'None',
          prowess: '2d8',
          willpower: '2d8'
        },
        closeCombatWeapons: [{
          id: 'weapon-1',
          name: 'Unarmed',
          type: 'close',
          baseCost: 0,
          maxActions: 2,
          notes: ''
        }],
        rangedWeapons: [],
        equipment: [],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 0
      };

      const response = await request(app)
        .post('/api/calculate-cost')
        .send({
          weirdo,
          warbandAbility: 'Cyborgs'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cost');
      expect(response.body.cost).toBeGreaterThan(0);
    });

    it('should calculate cost for a warband', async () => {
      const warband: Partial<Warband> = {
        id: 'warband-1',
        name: 'Test Warband',
        ability: 'Cyborgs',
        pointLimit: 75,
        totalCost: 0,
        weirdos: [{
          id: 'weirdo-1',
          name: 'Test Leader',
          type: 'leader',
          attributes: {
            speed: 1,
            defense: '2d6',
            firepower: 'None',
            prowess: '2d6',
            willpower: '2d6'
          },
          closeCombatWeapons: [{
            id: 'weapon-1',
            name: 'Unarmed',
            type: 'close',
            baseCost: 0,
            maxActions: 2,
            notes: ''
          }],
          rangedWeapons: [],
          equipment: [],
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 0
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const response = await request(app)
        .post('/api/calculate-cost')
        .send({ warband });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cost');
      expect(response.body.cost).toBeGreaterThan(0);
    });

    it('should return 400 for invalid request', async () => {
      const response = await request(app)
        .post('/api/calculate-cost')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/validate', () => {
    it('should validate a warband', async () => {
      const warband: Partial<Warband> = {
        id: 'warband-1',
        name: 'Test Warband',
        ability: 'Cyborgs',
        pointLimit: 75,
        totalCost: 0,
        weirdos: [{
          id: 'weirdo-1',
          name: 'Test Leader',
          type: 'leader',
          attributes: {
            speed: 1,
            defense: '2d6',
            firepower: 'None',
            prowess: '2d6',
            willpower: '2d6'
          },
          closeCombatWeapons: [{
            id: 'weapon-1',
            name: 'Unarmed',
            type: 'close',
            baseCost: 0,
            maxActions: 2,
            notes: ''
          }],
          rangedWeapons: [],
          equipment: [],
          psychicPowers: [],
          leaderTrait: null,
          notes: '',
          totalCost: 0
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const response = await request(app)
        .post('/api/validate')
        .send({ warband });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid');
      expect(response.body).toHaveProperty('errors');
    });

    it('should validate a weirdo within warband context', async () => {
      const weirdo: Partial<Weirdo> = {
        id: 'weirdo-1',
        name: 'Test Leader',
        type: 'leader',
        attributes: {
          speed: 1,
          defense: '2d6',
          firepower: 'None',
          prowess: '2d6',
          willpower: '2d6'
        },
        closeCombatWeapons: [{
          id: 'weapon-1',
          name: 'Unarmed',
          type: 'close',
          baseCost: 0,
          maxActions: 2,
          notes: ''
        }],
        rangedWeapons: [],
        equipment: [],
        psychicPowers: [],
        leaderTrait: null,
        notes: '',
        totalCost: 0
      };

      const warband: Partial<Warband> = {
        id: 'warband-1',
        name: 'Test Warband',
        ability: 'Cyborgs',
        pointLimit: 75,
        totalCost: 0,
        weirdos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const response = await request(app)
        .post('/api/validate')
        .send({ weirdo, warband });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('valid');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for invalid request', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
