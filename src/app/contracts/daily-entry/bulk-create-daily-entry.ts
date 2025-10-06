export interface BulkCreateDailyEntry {
    entryDate: string; // ISO date string (YYYY-MM-DD)
    machineEntries: MachineEntryItem[];
}

export interface MachineEntryItem {
    machineId: string;
    currentTotalHours: number;
    newTotalHours: number;
    fuelConsumption: number;
}

export interface BulkCreateDailyEntryResponse {
    success: boolean;
    message: string;
    successCount: number;
    errorCount: number;
    errorMessages: string[];
    entryDate: string; // ISO date string
}
