export class Quarry {
    id: string;
    name: string;
    description?: string;
    location?: string;
    
    // Konum bilgileri (UTM 35T)
    utmEasting?: number;
    utmNorthing?: number;
    altitude?: number;
    pafta?: string;
    
    // Google Maps koordinatları (otomatik dönüştürülür)
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
    
    // Konum bilgileri (UTM 35T)
    utmEasting?: number;
    utmNorthing?: number;
    altitude?: number;
    pafta?: string;
    
    // Google Maps koordinatları
    latitude?: number;
    longitude?: number;
    coordinateDescription?: string;
}
