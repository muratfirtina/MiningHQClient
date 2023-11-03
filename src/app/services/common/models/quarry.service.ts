import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateQuarry } from 'src/app/contracts/quarry/create-quarry';
import { ListQuarry } from 'src/app/contracts/quarry/list-quarry';
import { HttpClientService } from '../http-client.service';

@Injectable({
  providedIn: 'root'
})
export class QuarryService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListQuarry> {
    const observable: Observable<ListQuarry> = this.httpClientService.get<ListQuarry>({
      controller: 'quarries',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async add(quarry: CreateQuarry, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateQuarry> {
    const observable: Observable<CreateQuarry> = this.httpClientService.post<CreateQuarry>({
      controller: 'quarries'
    }, quarry);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
