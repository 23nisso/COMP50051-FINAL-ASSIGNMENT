import request from 'supertest';
import express from 'express';
import { LeaveTypeRouter } from '../../../src/routes/LeaveTypeRouter';

const app = express();
app.use(express.json());
app.use('/leavetypes', LeaveTypeRouter);

describe('LeaveTypeRouter', () => {
  it('should fetch all leave types', async () => {
    const res = await request(app).get('/leavetypes');
    expect(res.statusCode).toBe(200);
  });

  it('should create a new leave type', async () => {
    const newLeaveTypeId = {
    };
    const res = await request(app).post('/leavetypes').send(newLeaveTypeId);
    expect(res.statusCode).toBe(201);
  });
});