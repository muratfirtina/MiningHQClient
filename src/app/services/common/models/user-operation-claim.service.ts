import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ListUserOperationClaim } from 'src/app/contracts/userOperationClaim/list-user-operation-claim';
import { CreateUserOperationClaim } from 'src/app/contracts/userOperationClaim/create-user-operation-claim';
import { UserOperationClaim } from 'src/app/contracts/userOperationClaim/user-operation-claim';

@Injectable({
  providedIn: 'root'
})
export class UserOperationClaimService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 100, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListUserOperationClaim> {
    const observable: Observable<ListUserOperationClaim> = this.httpClientService.get<ListUserOperationClaim>({
      controller: 'useroperationclaims',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getUserClaims(userId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<UserOperationClaim[]> {
    const allClaims = await this.list(0, 1000);
    return allClaims.items.filter(claim => claim.userId === userId);
  }

  async create(userClaim: CreateUserOperationClaim, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<UserOperationClaim> {
    const observable: Observable<UserOperationClaim> = this.httpClientService.post<UserOperationClaim>({
      controller: 'useroperationclaims'
    }, userClaim);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async delete(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any> {
    const observable: Observable<any> = this.httpClientService.delete<any>({
      controller: 'useroperationclaims'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
