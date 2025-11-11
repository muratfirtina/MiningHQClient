import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { UserRole } from 'src/app/contracts/userRole/user-role';
import { CreateUserRole } from 'src/app/contracts/userRole/create-user-role';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  constructor(private httpClientService: HttpClientService) { }

  // Backend'de list endpoint'i yok, bu yüzden tüm user'lar için manuel toplamıyoruz
  // Sadece getUserRoles metodunu kullanacağız
  async list(pageIndex: number = 0, pageSize: number = 1000): Promise<{ items: UserRole[], count: number }> {
    // Backend'de genel list endpoint'i olmadığı için boş döndür
    console.warn('UserRoles list endpoint backend\'de mevcut değil. Sadece getUserRoles() kullanılabilir.');
    return { items: [], count: 0 };
  }

  async getUserRoles(userId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<UserRole[]> {
    const observable: Observable<UserRole[]> = this.httpClientService.get<UserRole[]>({
      controller: 'userroles',
      action: `user/${userId}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async create(userRole: CreateUserRole, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<UserRole> {
    const observable: Observable<UserRole> = this.httpClientService.post<UserRole>({
      controller: 'userroles',
      action: 'assign'
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
