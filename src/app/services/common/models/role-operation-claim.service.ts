import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ListRoleOperationClaim } from 'src/app/contracts/roleOperationClaim/list-role-operation-claim';
import { RoleOperationClaim } from 'src/app/contracts/roleOperationClaim/role-operation-claim';
import { CreateRoleOperationClaim } from 'src/app/contracts/roleOperationClaim/create-role-operation-claim';

@Injectable({
  providedIn: 'root'
})
export class RoleOperationClaimService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 1000, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListRoleOperationClaim> {
    const observable: Observable<ListRoleOperationClaim> = this.httpClientService.get<ListRoleOperationClaim>({
      controller: 'roleoperationclaims',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getRoleClaims(roleId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<RoleOperationClaim[]> {
    const allClaims = await this.list(0, 1000);
    return allClaims.items.filter(claim => claim.roleId === roleId);
  }

  async create(roleClaim: CreateRoleOperationClaim, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<RoleOperationClaim> {
    const observable: Observable<RoleOperationClaim> = this.httpClientService.post<RoleOperationClaim>({
      controller: 'roleoperationclaims'
    }, roleClaim);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async delete(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any> {
    const observable: Observable<any> = this.httpClientService.delete<any>({
      controller: 'roleoperationclaims'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
