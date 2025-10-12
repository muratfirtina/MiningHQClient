export class Machine {
    id: string;
    name: string;
    serialNumber: string;
    
    // Type Information
    machineTypeId: string;
    machineTypeName: string;
    
    // Brand and Model
    brandId: string;
    brandName: string;
    modelId: string;
    modelName: string;
    
    // Location
    quarryId: string;
    quarryName: string;
    
    // Additional Info
    purchaseDate?: string;
    startWorkDate?: string;
    initialWorkingHoursOrKm?: number;
    description?: string;
    
    // Working Hours
    currentWorkingHours?: number;
    
    // Current Operator
    currentOperatorId?: string;
    currentOperatorName?: string;
    
    // Maintenance Information
    nextMaintenanceHour?: number;
    
    // Metadata
    createdDate?: string;
    updatedDate?: string;
    deletedDate?: string;
    
    // Status
    isActive?: boolean;
    isDeleted?: boolean;
}
