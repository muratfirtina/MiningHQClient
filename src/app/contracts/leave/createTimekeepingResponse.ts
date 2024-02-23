import { TimekeepingStatus } from "./timekeepingStatusEnum";

export interface CreatedTimekeepingResponse {
    id: string;
    date: Date;
    employeeId?: string;
    status?: TimekeepingStatus
  }