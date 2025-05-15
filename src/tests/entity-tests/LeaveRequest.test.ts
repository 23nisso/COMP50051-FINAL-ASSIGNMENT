import { LeaveRequest } from '../../../src/entities/LeaveRequest';

describe('LeaveRequest Entity', () => {
  it('should create a LeaveRequest instance with correct properties', () => {
    const leaveRequest = new LeaveRequest();
    leaveRequest.leaveRequestId = 1;
    leaveRequest.userId = 1;
    leaveRequest.leaveTypeId = 1;
    leaveRequest.startDate = new Date('2025-01-01');
    leaveRequest.endDate = new Date('2025-01-05');
    leaveRequest.status = 'Pending';

    expect(leaveRequest.leaveRequestId).toBe(1);
    expect(leaveRequest.userId).toBe(1);
    expect(leaveRequest.leaveTypeId).toBe(1);
    expect(leaveRequest.startDate).toEqual(new Date('2025-01-01'));
    expect(leaveRequest.endDate).toEqual(new Date('2025-01-05'));
    expect(leaveRequest.status).toBe('Pending');
  });
});