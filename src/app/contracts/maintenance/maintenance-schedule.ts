export interface MaintenanceSchedule {
    machineId: string;
    machineName: string;
    serialNumber: string;
    machineTypeName: string;
    brandName: string;
    modelName: string;
    quarryName: string;
    
    // Son bakım bilgileri
    lastMaintenanceDate?: Date;
    lastMaintenanceHourOrKm?: number;
    lastMaintenanceType?: string;
    lastMaintenanceFirm?: string;
    
    // Gelecek bakım bilgileri
    nextMaintenanceHour?: number;
    currentWorkingHourOrKm?: number;
    remainingHourOrKm?: number;
    
    // Durum bilgisi
    maintenanceStatus: string; // "Yaklaşıyor", "Gecikmiş", "Normal"
}
