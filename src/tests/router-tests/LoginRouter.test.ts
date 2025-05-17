import request from 'supertest';
import express from 'express';
import { LoginRouter } from '../../routers/LoginRouter';

const app = express();
app.use(express.json());
app.use('/login', LoginRouter);

describe('LoginRouter', () => {
  it('should authenticate user with valid credentials', async () => {
    const credentials = {
      username: 'testuser',
      password: 'testpassword',
    };
    const res = await request(app).post('/login').send(credentials);
    expect(res.statusCode).toBe(200);
  });

  it('should reject user with invalid credentials', async () => {
    const credentials = {
      username: 'invaliduser',
      password: 'wrongpassword',
    };
    const res = await request(app).post('/login').send(credentials);
    expect(res.statusCode).toBe(401);
  });
});