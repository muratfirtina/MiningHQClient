export class Quarry {
    id: string;
    name: string;
    description?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    coordinateDescription?: string;
    miningEngineerId?: string;
    miningEngineer?: MiningEngineerDto;
    employees?: EmployeeDto[];
    machines?: MachineDto[];
    quarryFiles?: QuarryFileDto[];
    quarryProductions?: QuarryProductionDto[];
    // For list view
    employeeCount?: number;
    machineCount?: number;
}

export class MiningEngineerDto {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export class EmployeeDto {
    id: string;
    firstName: string;
    lastName: string;
    jobName?: string;
    departmentName?: string;
    phone?: string;
}

export class MachineDto {
    id: string;
    name?: string;
    serialNumber: string;
    machineTypeName?: string;
    brandName?: string;
    modelName?: string;
}

export class QuarryFileDto {
    id: string;
    fileName: string;
    path: string;
    storage: string;
}

export class QuarryProductionDto {
    id: string;
    weekStartDate: Date;
    weekEndDate: Date;
    productionAmount: number;
    productionUnit?: string;
    stockAmount: number;
    stockUnit?: string;
    salesAmount: number;
    salesUnit?: string;
    notes?: string;
}
