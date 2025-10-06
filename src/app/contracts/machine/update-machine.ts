export class UpdateMachine {
    // Required ID
    id: string;
    
    // Basic Information
    name: string;
    serialNumber: string;
    
    // Type Information
    machineTypeId: string;
    
    // Model
    modelId: string;
    
    // Location
    quarryId: string;
    
    // Additional Info (Optional)
    purchaseDate?: string;
    description?: string;
    
    // Current Operator (Optional)
    currentOperatorId?: string;
}
