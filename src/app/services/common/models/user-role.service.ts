import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ListUserRole } from 'src/app/contracts/userRole/list-user-role';
import { UserRole } from 'src/app/contracts/userRole/user-role';
import { CreateUserRole } from 'src/app/contracts/userRole/create-user-role';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 1000, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListUserRole> {
    const observable: Observable<ListUserRole> = this.httpClientService.get<ListUserRole>({
      controller: 'userroles',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getUserRoles(userId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<UserRole[]> {
    const allRoles = await this.list(0, 1000);
    return allRoles.items.filter(role => role.userId === userId);
  }

  async create(userRole: CreateUserRole, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<UserRole> {
    const observable: Observable<UserRole> = this.httpClientService.post<UserRole>({
      controller: 'userroles'
    }, userRole);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async delete(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any> {
    const observable: Observable<any> = this.httpClientService.delete<any>({
      controller: 'userroles'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
