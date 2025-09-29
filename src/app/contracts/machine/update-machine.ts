export class UpdateMachine {
    // Required ID
    id: string;
    
    // Basic Information
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
    
    // Additional Info (Optional)
    purchaseDate?: string;
    description?: string;
}
