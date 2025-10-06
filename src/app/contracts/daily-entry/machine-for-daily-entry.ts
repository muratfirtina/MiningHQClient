export interface MachineForDailyEntry {
    machineId: string;
    machineName: string;
    brandName?: string;
    modelName?: string;
    machineTypeName?: string;
    quarryName?: string;
    serialNumber: string;
    currentOperatorName?: string;
    currentTotalHours: number;
    lastEntryDate?: string; // ISO date string
    newTotalHours: number;
    fuelConsumption: number;
    // UI state
    isEdited?: boolean;
    calculatedWorkHours?: number;
}
