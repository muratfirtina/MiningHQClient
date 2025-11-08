import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ListOperationClaim } from 'src/app/contracts/operationClaim/list-operation-claim';
import { OperationClaim } from 'src/app/contracts/operationClaim/operation-claim';

@Injectable({
  providedIn: 'root'
})
export class OperationClaimService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 100, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListOperationClaim> {
    const observable: Observable<ListOperationClaim> = this.httpClientService.get<ListOperationClaim>({
      controller: 'operationclaims',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getById(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<OperationClaim> {
    const observable: Observable<OperationClaim> = this.httpClientService.get<OperationClaim>({
      controller: 'operationclaims'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
