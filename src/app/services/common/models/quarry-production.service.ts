import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateQuarryProduction } from 'src/app/contracts/quarryProduction/create-quarry-production';
import { ListQuarryProduction } from 'src/app/contracts/quarryProduction/list-quarry-production';
import { QuarryProduction } from 'src/app/contracts/quarryProduction/quarry-production';
import { HttpClientService } from '../http-client.service';

@Injectable({
  providedIn: 'root'
})
export class QuarryProductionService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, quarryId?: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListQuarryProduction> {
    let queryString = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (quarryId) {
      queryString += `&quarryId=${quarryId}`;
    }
    
    const observable: Observable<ListQuarryProduction> = this.httpClientService.get<ListQuarryProduction>({
      controller: 'quarryproductions',
      queryString: queryString
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async add(production: CreateQuarryProduction, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<QuarryProduction> {
    const observable: Observable<QuarryProduction> = this.httpClientService.post<QuarryProduction>({
      controller: 'quarryproductions'
    }, production);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
