import { Timekeeping } from "./timekeeping";

export class TimekeepingList{
    employeeId: string;
    firstName: string;
    lastName: string;
    hireDate: Date;
    totalRemainingDays: number;
    timekeepings: Timekeeping[];
}
