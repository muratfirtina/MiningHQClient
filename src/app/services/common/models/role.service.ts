import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ListRole } from 'src/app/contracts/role/list-role';
import { Role } from 'src/app/contracts/role/role';
import { CreateRole } from 'src/app/contracts/role/create-role';
import { UpdateRole } from 'src/app/contracts/role/update-role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 100, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListRole> {
    const observable: Observable<ListRole> = this.httpClientService.get<ListRole>({
      controller: 'roles',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getById(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<Role> {
    const observable: Observable<Role> = this.httpClientService.get<Role>({
      controller: 'roles'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async create(role: CreateRole, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<Role> {
    const observable: Observable<Role> = this.httpClientService.post<Role>({
      controller: 'roles'
    }, role);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async update(role: UpdateRole, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<Role> {
    const observable: Observable<Role> = this.httpClientService.put<Role>({
      controller: 'roles'
    }, role);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async delete(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any> {
    const observable: Observable<any> = this.httpClientService.delete<any>({
      controller: 'roles'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
