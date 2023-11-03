import { Injectable } from '@angular/core';
import { ListBrand } from 'src/app/contracts/brand/list-brand';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateBrand } from 'src/app/contracts/brand/create-brand';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListBrand> {
    const observable: Observable<ListBrand> = this.httpClientService.get<ListBrand>({
      controller: 'brands',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async add(brand: CreateBrand, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateBrand> {
    const observable: Observable<CreateBrand> = this.httpClientService.post<CreateBrand>({
      controller: 'brands'
    }, brand);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
