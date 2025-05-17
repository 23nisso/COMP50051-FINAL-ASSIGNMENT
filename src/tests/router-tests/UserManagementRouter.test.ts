import request from 'supertest';
import express from 'express';
import { UserManagementRouter } from '../../routers/UserManagementRouter';

const app = express();
app.use(express.json());
app.use('/user-management', UserManagementRouter);

describe('UserManagementRouter', () => {
  it('should fetch all users', async () => {
    const res = await request(app).get('/user-management');
    expect(res.statusCode).toBe(200);
  });

  it('should create a new user', async () => {
    const newUser = {
    };
    const res = await request(app).post('/user-management').send(newUser);
    expect(res.statusCode).toBe(201);
  });
});