import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Inject } from '@angular/core';
import { ListUserOperationClaim } from 'src/app/contracts/userOperationClaim/list-user-operation-claim';
import { CreateUserOperationClaim } from 'src/app/contracts/userOperationClaim/create-user-operation-claim';
import { UserOperationClaim } from 'src/app/contracts/userOperationClaim/user-operation-claim';

@Injectable({
  providedIn: 'root'
})
export class UserOperationClaimService {

  constructor(
    private httpClientService: HttpClientService,
    private httpClient: HttpClient,
    @Inject("baseUrl") private baseUrl: string
  ) { }

  // Backend endpoint: GET /api/useroperationclaims?PageRequest.Page=...&PageRequest.PageSize=...
  async list(pageIndex: number = 0, pageSize: number = 100, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListUserOperationClaim> {
    const observable: Observable<ListUserOperationClaim> = this.httpClientService.get<ListUserOperationClaim>({
      controller: 'useroperationclaims',
      queryString: `PageRequest.Page=${pageIndex}&PageRequest.PageSize=${pageSize}`
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

  // Backend endpoint: POST /api/useroperationclaims
  async create(userClaim: CreateUserOperationClaim, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<UserOperationClaim> {
    const observable: Observable<UserOperationClaim> = this.httpClientService.post<UserOperationClaim>({
      controller: 'useroperationclaims'
    }, userClaim);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  // Backend endpoint: DELETE /api/useroperationclaims (body'de id bekliyor)
  async delete(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any> {
    const url = `${this.baseUrl}/useroperationclaims`;
    const observable: Observable<any> = this.httpClient.delete<any>(url, {
      body: { id: id }
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
