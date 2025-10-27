export interface MachinePerformanceReport {
  machineId: string;
  machineName: string;
  plateCode: string;
  brandName: string;
  modelName: string;
  weeklyPerformance: PerformancePeriod;
  monthlyPerformance: PerformancePeriod;
  yearlyPerformance: PerformancePeriod;
}

export interface PerformancePeriod {
  totalWorkingHours: number;
  totalWorkingDays: number;
  totalFuelConsumption: number;
  averageDailyHours: number;
  averageDailyFuelConsumption: number;
  startDate: Date;
  endDate: Date;
}
