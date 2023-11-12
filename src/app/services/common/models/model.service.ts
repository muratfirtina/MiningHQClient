import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { ListModel } from 'src/app/contracts/model/list-model';
import { CreateModel } from 'src/app/contracts/model/create-model';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListModel> {
    const observable: Observable<ListModel> = this.httpClientService.get<ListModel>({
      controller: 'models',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async add(model: CreateModel, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateModel> {
    const observable: Observable<CreateModel> = this.httpClientService.post<CreateModel>({
      controller: 'models'
    }, model);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async listByBrandId(brandId: string,successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListModel> {
    const observable: Observable<ListModel> = this.httpClientService.get<ListModel>({
      controller: 'models',
      action: `ByBrand/${brandId}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
