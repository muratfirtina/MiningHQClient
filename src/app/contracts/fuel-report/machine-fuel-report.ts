export interface MachineFuelReport {
    // Machine Info
    machineId: string;
    machineName: string;
    brandName?: string;
    modelName?: string;
    machineTypeName?: string;
    serialNumber: string;
    
    // Date Range
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    totalDays: number;
    workingDays: number;
    
    // Statistics
    totalFuelConsumption: number;
    totalWorkHours: number;
    dailyAverage: number;
    weeklyAverage: number;
    monthlyAverage: number;
    yearlyAverage: number;
    fuelPerHour: number;
    averageWorkHoursPerDay: number;
    
    // Detailed Data
    dailyBreakdown: DailyFuelBreakdown[];
    weeklySummary: WeeklyFuelSummary[];
    monthlySummary: MonthlyFuelSummary[];
}

export interface DailyFuelBreakdown {
    date: string; // ISO date string
    fuelConsumption: number;
    workingHours: number;
    fuelPerHour: number;
}

export interface WeeklyFuelSummary {
    year: number;
    weekNumber: number;
    totalFuel: number;
    averageFuel: number;
    daysWorked: number;
    totalWorkHours: number;
}

export interface MonthlyFuelSummary {
    year: number;
    month: number;
    totalFuel: number;
    averageFuel: number;
    daysWorked: number;
    totalWorkHours: number;
}
