export class LeaveEntitledUsage{
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    totalRemainingDays: number;
    entitledDate: Date;
    entitledDays: number;
    startDate: Date;
    endDate: Date;
}