import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ListMachineType } from 'src/app/contracts/machine-type/list-machine-type';
import { CreateMachineType } from 'src/app/contracts/machine-type/create-machine-type';

@Injectable({
  providedIn: 'root'
})
export class MachineTypeService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListMachineType> {
    const observable: Observable<ListMachineType> = this.httpClientService.get<ListMachineType>({
      controller: 'machinetypes',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async add(machineType: CreateMachineType, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateMachineType> {
    const observable: Observable<CreateMachineType> = this.httpClientService.post<CreateMachineType>({
      controller: 'machinetypes'
    }, machineType);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async listByBrandId(brandId: string,successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListMachineType> {
    const observable: Observable<ListMachineType> = this.httpClientService.get<ListMachineType>({
      controller: 'machinetypes',
      action: `ByBrand/${brandId}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
