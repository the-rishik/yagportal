const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const { connectDB, disconnectDB, clearDB, createTestUser } = require('../helpers/db');

describe('Auth Routes', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        school: 'Test School'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.role).toBe('Student');
      expect(response.body.user.mustChangePassword).toBe(false);
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
        school: 'Test School'
      };

      // Create user first
      await createTestUser(userData);

      // Try to register same user again
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    it('should set mustChangePassword to true for default password', async () => {
      const userData = {
        email: 'default@example.com',
        password: 'njyag',
        firstName: 'Default',
        lastName: 'User',
        school: 'Test School'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.mustChangePassword).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
        school: 'Test School'
      };

      // Create user first
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid password', async () => {
      const userData = {
        email: 'wrongpass@example.com',
        password: 'password123',
        firstName: 'Wrong',
        lastName: 'Pass',
        school: 'Test School'
      };

      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await createTestUser();
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const user = await createTestUser({ password: 'oldpassword' });
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'oldpassword',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123'
        })
        .expect(200);

      expect(response.body.message).toBe('Password changed successfully.');
    });

    it('should return 400 if old password is incorrect', async () => {
      const user = await createTestUser({ password: 'oldpassword' });
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'wrongpassword',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123'
        })
        .expect(400);

      expect(response.body.message).toBe('Old password is incorrect.');
    });

    it('should return 400 if new passwords do not match', async () => {
      const user = await createTestUser({ password: 'oldpassword' });
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'oldpassword',
          newPassword: 'newpassword123',
          confirmPassword: 'differentpassword'
        })
        .expect(400);

      expect(response.body.message).toBe('New passwords do not match.');
    });
  });
}); 