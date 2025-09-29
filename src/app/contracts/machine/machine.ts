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
    description?: string;
    
    // Metadata
    createdDate?: string;
    updatedDate?: string;
    deletedDate?: string;
    
    // Status
    isActive?: boolean;
    isDeleted?: boolean;
}
