import { TimekeepingStatus } from "./timekeepingStatusEnum";

export interface CreateTimekeeping{
    date: Date;
    employeeId: string;
    status: TimekeepingStatus
  }