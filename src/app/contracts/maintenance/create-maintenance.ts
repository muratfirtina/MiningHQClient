export interface CreateMaintenance {
  machineId: string;
  maintenanceTypeId: string;
  description: string;
  maintenanceDate: Date;
  machineWorkingTimeOrKilometer: number;
  maintenanceFirm: string;
  nextMaintenanceHour?: number;
  partsChanged?: string;
  oilsChanged?: string;
}
