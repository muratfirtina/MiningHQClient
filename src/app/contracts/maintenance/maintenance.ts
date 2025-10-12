export interface Maintenance {
  id: string;
  machineId: string;
  machineName?: string;
  maintenanceTypeId: string;
  maintenanceTypeName?: string;
  description: string;
  maintenanceDate: Date;
  machineWorkingTimeOrKilometer: number;
  maintenanceFirm: string;
  nextMaintenanceHour?: number;
  partsChanged?: string;
  oilsChanged?: string;
  fileCount?: number;
  maintenanceFiles?: MaintenanceFileDto[];
}

export interface MaintenanceFileDto {
  id: string;
  name: string;
  path: string;
  category: string;
  storage: string;
}
