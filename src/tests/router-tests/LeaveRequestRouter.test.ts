import request from 'supertest';
import express from 'express';
import { LeaveRequestRouter } from '../../routers/LeaveRequestRouter';

const app = express();
app.use(express.json());
app.use('/leave-requests', LeaveRequestRouter);

describe('LeaveRequestRouter', () => {
  it('should fetch all leave requests', async () => {
    const res = await request(app).get('/leave-requests');
    expect(res.statusCode).toBe(200);
  });

  it('should create a new leave request', async () => {
    const newLeaveRequest = {
    };
    const res = await request(app).post('/leave-requests').send(newLeaveRequest);
    expect(res.statusCode).toBe(201);
  });
});