export class UpdateQuarry{
    id: string;
    name: string;
    description?: string;
    location?: string;
    
    // Konum bilgileri (UTM 35T)
    utmEasting?: number;
    utmNorthing?: number;
    altitude?: number;
    pafta?: string;
    coordinateDescription?: string;
    
    miningEngineerId?: string;
}
