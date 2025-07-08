const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const { connectDB, disconnectDB, clearDB, createTestUser, createTestBill } = require('../helpers/db');

describe('Bills Routes', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
    testUser = await createTestUser();
    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET);
  });

  describe('POST /api/bills', () => {
    it('should create a new bill successfully', async () => {
      const billData = {
        title: 'Test Bill Title',
        content: 'This is the content of the test bill',
        category: 'environment'
      };

      const response = await request(app)
        .post('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .send(billData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(billData.title);
      expect(response.body.content).toBe(billData.content);
      expect(response.body.category).toBe(billData.category);
      expect(response.body.status).toBe('draft');
      expect(response.body.author).toBe(testUser._id.toString());
      expect(response.body.school).toBe(testUser.school);
    });

    it('should return 401 without authentication', async () => {
      const billData = {
        title: 'Test Bill',
        content: 'Test content',
        category: 'environment'
      };

      await request(app)
        .post('/api/bills')
        .send(billData)
        .expect(401);
    });
  });

  describe('GET /api/bills', () => {
    it('should return all bills for authenticated user', async () => {
      // Create test bills
      await createTestBill({ author: testUser._id });
      await createTestBill({ author: testUser._id });

      const response = await request(app)
        .get('/api/bills')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should filter bills by status', async () => {
      await createTestBill({ author: testUser._id, status: 'draft' });
      await createTestBill({ author: testUser._id, status: 'submitted' });

      const response = await request(app)
        .get('/api/bills?status=draft')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('draft');
    });

    it('should filter bills by category', async () => {
      await createTestBill({ author: testUser._id, category: 'environment' });
      await createTestBill({ author: testUser._id, category: 'public_safety' });

      const response = await request(app)
        .get('/api/bills?category=environment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].category).toBe('environment');
    });
  });

  describe('GET /api/bills/my-bills', () => {
    it('should return only user\'s bills', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      
      // Create bills for both users
      await createTestBill({ author: testUser._id });
      await createTestBill({ author: testUser._id });
      await createTestBill({ author: otherUser._id });

      const response = await request(app)
        .get('/api/bills/my-bills')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBe(2);
      response.body.forEach(bill => {
        expect(bill.author).toBe(testUser._id.toString());
      });
    });
  });

  describe('GET /api/bills/:id', () => {
    it('should return a specific bill', async () => {
      const bill = await createTestBill({ author: testUser._id });

      const response = await request(app)
        .get(`/api/bills/${bill._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body._id).toBe(bill._id.toString());
      expect(response.body.title).toBe(bill.title);
    });

    it('should return 404 for non-existent bill', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await request(app)
        .get(`/api/bills/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/bills/:id', () => {
    it('should update a draft bill', async () => {
      const bill = await createTestBill({ author: testUser._id, status: 'draft' });
      
      const updates = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const response = await request(app)
        .patch(`/api/bills/${bill._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.title).toBe(updates.title);
      expect(response.body.content).toBe(updates.content);
    });

    it('should not allow updating non-draft bills', async () => {
      const bill = await createTestBill({ author: testUser._id, status: 'submitted' });
      
      const updates = { title: 'Updated Title' };

      await request(app)
        .patch(`/api/bills/${bill._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(400);
    });

    it('should not allow updating other user\'s bills', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const bill = await createTestBill({ author: otherUser._id, status: 'draft' });
      
      const updates = { title: 'Updated Title' };

      await request(app)
        .patch(`/api/bills/${bill._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(403);
    });
  });

  describe('PATCH /api/bills/:id/submit', () => {
    it('should submit a draft bill', async () => {
      const bill = await createTestBill({ author: testUser._id, status: 'draft' });

      const response = await request(app)
        .patch(`/api/bills/${bill._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('submitted');
    });

    it('should not allow submitting non-draft bills', async () => {
      const bill = await createTestBill({ author: testUser._id, status: 'submitted' });

      await request(app)
        .patch(`/api/bills/${bill._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/bills/:id/comments', () => {
    it('should add a comment to a bill', async () => {
      const bill = await createTestBill({ author: testUser._id });
      
      const commentData = {
        text: 'This is a test comment'
      };

      const response = await request(app)
        .post(`/api/bills/${bill._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(200);

      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].text).toBe(commentData.text);
      expect(response.body.comments[0].author).toBe(testUser._id.toString());
    });
  });
}); 