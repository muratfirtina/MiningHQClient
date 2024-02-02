import { LeaveEntitled } from "./leaveEntitled";

export class EntitledLeaveListByEmployeeId {
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: LeaveEntitled[];
}
