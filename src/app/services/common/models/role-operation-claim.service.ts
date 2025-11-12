import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { RoleOperationClaim } from 'src/app/contracts/roleOperationClaim/role-operation-claim';
import { CreateRoleOperationClaim } from 'src/app/contracts/roleOperationClaim/create-role-operation-claim';

@Injectable({
  providedIn: 'root'
})
export class RoleOperationClaimService {

  constructor(private httpClientService: HttpClientService) { }

  // Backend'de list all endpoint'i yok, bu yüzden boş döndür
  async list(pageIndex: number = 0, pageSize: number = 1000): Promise<{ items: RoleOperationClaim[], count: number }> {
    console.warn('RoleOperationClaims list endpoint backend\'de mevcut değil. Sadece getRoleClaims(roleId) kullanılabilir.');
    return { items: [], count: 0 };
  }

  // Backend endpoint: GET /api/roleoperationclaims/role/{roleId}
  async getRoleClaims(roleId: number, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<RoleOperationClaim[]> {
    const observable: Observable<RoleOperationClaim[]> = this.httpClientService.get<RoleOperationClaim[]>({
      controller: 'roleoperationclaims',
      action: `role/${roleId}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  // Backend endpoint: POST /api/roleoperationclaims/assign
  async create(roleClaim: CreateRoleOperationClaim, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<RoleOperationClaim> {
    const observable: Observable<RoleOperationClaim> = this.httpClientService.post<RoleOperationClaim>({
      controller: 'roleoperationclaims',
      action: 'assign'
    }, roleClaim);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  // Backend endpoint: DELETE /api/roleoperationclaims/{id}
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
