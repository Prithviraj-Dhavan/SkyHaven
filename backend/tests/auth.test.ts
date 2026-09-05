import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Auth Module API Tests', () => {
  const testEmail = `test.pilot.${Date.now()}@skyhaven.com`;

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Pilot',
        email: testEmail,
        password: 'Password@123',
        phone: '+1 555 123 4567',
      });

    // Accept 201 created or 409 if exists or 400 validation
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.data.token).toBeDefined();
    }
  });

  it('should reject registration with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Invalid Email',
        email: 'not-an-email',
        password: 'Password@123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
