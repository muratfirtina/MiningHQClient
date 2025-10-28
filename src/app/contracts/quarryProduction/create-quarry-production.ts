export class CreateQuarryProduction {
    quarryId: string;
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
