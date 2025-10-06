import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { MachineForDailyEntry } from 'src/app/contracts/daily-entry/machine-for-daily-entry';
import { BulkCreateDailyEntry, BulkCreateDailyEntryResponse } from 'src/app/contracts/daily-entry/bulk-create-daily-entry';

@Injectable({
  providedIn: 'root'
})
export class DailyEntryService {

  constructor(private httpClientService: HttpClientService) { }

  async getMachinesForDailyEntry(
    successCallback?: () => void, 
    errorCallback?: (errorMessage: string) => void
  ): Promise<MachineForDailyEntry[]> {
    const observable: Observable<MachineForDailyEntry[]> = this.httpClientService.get<MachineForDailyEntry[]>({
      controller: 'dailyentries',
      action: 'machines'
    });

    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async bulkCreateDailyEntry(
    data: BulkCreateDailyEntry,
    successCallback?: () => void, 
    errorCallback?: (errorMessage: string) => void
  ): Promise<BulkCreateDailyEntryResponse> {
    const observable: Observable<BulkCreateDailyEntryResponse> = this.httpClientService.post<BulkCreateDailyEntryResponse>({
      controller: 'dailyentries'
    }, data);

    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
