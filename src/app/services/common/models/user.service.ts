import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { ListUser } from 'src/app/contracts/user/list-user';
import { CreateUser } from 'src/app/contracts/user/create-user';
import { UpdateUser } from 'src/app/contracts/user/update-user';
import { User } from 'src/app/contracts/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListUser> {
    const observable: Observable<ListUser> = this.httpClientService.get<ListUser>({
      controller: 'users',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getById(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<User> {
    const observable: Observable<User> = this.httpClientService.get<User>({
      controller: 'users'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async create(user: CreateUser, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<User> {
    const observable: Observable<User> = this.httpClientService.post<User>({
      controller: 'users'
    }, user);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async update(user: UpdateUser, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<User> {
    const observable: Observable<User> = this.httpClientService.put<User>({
      controller: 'users'
    }, user);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async delete(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any> {
    const observable: Observable<any> = this.httpClientService.delete<any>({
      controller: 'users'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
