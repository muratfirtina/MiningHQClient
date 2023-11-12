import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { ListMachine } from 'src/app/contracts/machine/list-machine';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateMachine } from 'src/app/contracts/machine/create-machine';
import { DynamicQuery } from 'src/app/contracts/dynamic-query';

@Injectable({
  providedIn: 'root'
})
export class MachineService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListMachine> {
    const observable: Observable<ListMachine> = this.httpClientService.get<ListMachine>({
      controller: 'machines',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async add(machine:CreateMachine, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateMachine> {
    const observable: Observable<CreateMachine> = this.httpClientService.post<CreateMachine>({
      controller: 'machines'
    }, machine);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async search(dynamicQuery: DynamicQuery, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListMachine> {
    const observable: Observable<ListMachine> = this.httpClientService.post<any>({
      controller: 'machines/search'
    }, dynamicQuery);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  
}
