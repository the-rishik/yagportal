const request = require('supertest');
const app = require('../../server');
const { connectDB, disconnectDB, clearDB, createTestUser, createTestBill } = require('../helpers/db');

describe('Stats Endpoint', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('GET /api/stats', () => {
    it('should return correct statistics', async () => {
      // Create test data
      const user1 = await createTestUser({ email: 'user1@example.com' });
      const user2 = await createTestUser({ email: 'user2@example.com' });
      
      // Create bills with different statuses
      await createTestBill({ author: user1._id, status: 'draft' }); // Not active
      await createTestBill({ author: user1._id, status: 'submitted' }); // Active
      await createTestBill({ author: user2._id, status: 'under_review' }); // Active
      await createTestBill({ author: user2._id, status: 'approved' }); // Active

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toHaveProperty('activeBills');
      expect(response.body).toHaveProperty('registeredUsers');
      expect(response.body).toHaveProperty('schools');

      expect(response.body.activeBills).toBe(3); // submitted, under_review, approved
      expect(response.body.registeredUsers).toBe(2);
      expect(response.body.schools).toBe(0); // No schools created in this test
    });

    it('should return zero counts for empty database', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body.activeBills).toBe(0);
      expect(response.body.registeredUsers).toBe(0);
      expect(response.body.schools).toBe(0);
    });

    it('should not count draft bills as active', async () => {
      const user = await createTestUser();
      
      // Create only draft bills
      await createTestBill({ author: user._id, status: 'draft' });
      await createTestBill({ author: user._id, status: 'draft' });

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body.activeBills).toBe(0);
      expect(response.body.registeredUsers).toBe(1);
    });
  });
}); 