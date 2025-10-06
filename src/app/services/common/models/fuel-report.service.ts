import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { MachineFuelReport } from 'src/app/contracts/fuel-report/machine-fuel-report';

@Injectable({
  providedIn: 'root'
})
export class FuelReportService {

  constructor(private httpClientService: HttpClientService) { }

  async getMachineFuelReport(
    machineId: string,
    startDate?: Date | string,
    endDate?: Date | string,
    successCallback?: () => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<MachineFuelReport> {
    let queryString = '';
    
    if (startDate) {
      const date = startDate instanceof Date ? startDate : new Date(startDate);
      queryString += `startDate=${date.toISOString()}`;
    }
    if (endDate) {
      const date = endDate instanceof Date ? endDate : new Date(endDate);
      queryString += queryString ? '&' : '';
      queryString += `endDate=${date.toISOString()}`;
    }

    const observable: Observable<MachineFuelReport> = this.httpClientService.get<MachineFuelReport>({
      controller: 'dailyfuelconsumptiondatas',
      action: `machine-fuel-report/${machineId}`,
      queryString: queryString
    });

    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
