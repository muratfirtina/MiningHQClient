export class QuarryProduction {
    id: string;
    quarryId: string;
    quarryName?: string;
    weekStartDate: Date;
    weekEndDate: Date;
    productionAmount: number;
    productionUnit?: string;
    stockAmount: number;
    stockUnit?: string;
    salesAmount: number;
    salesUnit?: string;
    notes?: string;
    cumulativeStock?: number;
    
    // Konum bilgileri (UTM 35T)
    utmEasting?: number;
    utmNorthing?: number;
    altitude?: number;
    pafta?: string;
    
    // Google Maps koordinatları (otomatik dönüştürülür)
    latitude?: number;
    longitude?: number;
    coordinateDescription?: string;
}
