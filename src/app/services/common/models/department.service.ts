import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { CreateDepartment } from 'src/app/contracts/department/createDepartment';
import { Observable, firstValueFrom } from 'rxjs';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { ListDepartment } from 'src/app/contracts/department/listDepartment';
import { Department } from 'src/app/contracts/department/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<ListDepartment>> {
    const observable : Observable<GetListResponse<ListDepartment>> = this.httpClientService.get<GetListResponse<ListDepartment>>({
      controller: 'departments',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;

  }

  async add(department: CreateDepartment, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateDepartment> {
    const observable: Observable<CreateDepartment> = this.httpClientService.post<CreateDepartment>({
      controller: 'departments'
    }, department);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async update(department: ListDepartment, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListDepartment> {
    const observable: Observable<ListDepartment> = this.httpClientService.put<ListDepartment>({
      controller: 'departments'
    }, department);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async delete(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<string> {
    const observable: Observable<string> = this.httpClientService.delete<string>({
      controller: 'departments',
      queryString: `id=${id}`
    },id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getById(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<Department> {
    const observable: Observable<Department> = this.httpClientService.get<Department>({
      controller: 'departments',
      queryString: `id=${id}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }




}
