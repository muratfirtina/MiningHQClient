export interface MachineStats {
    machineId: string;
    machineName: string;
    totalWorkDays: number;
    totalWorkHours: number;
    totalFuelUsed: number;
    averageFuelConsumptionPerHour: number;
    maintenanceCount: number;
    lastMaintenanceDate?: Date;
    nextScheduledMaintenance?: Date;
    totalProductionAmount: number;
}
