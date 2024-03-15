import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { ListEmployee } from 'src/app/contracts/employee/list-employee';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateEmployee } from 'src/app/contracts/employee/create-employee';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { Employee } from 'src/app/contracts/employee/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<SingleEmployee>> {
    const observable: Observable<GetListResponse<SingleEmployee>> = this.httpClientService.get<GetListResponse<SingleEmployee>>({
      controller: 'employees',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async shortList(pageRequest: PageRequest, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<Employee>> {
    const observable: Observable<GetListResponse<Employee>> = this.httpClientService.get<GetListResponse<Employee>>({
      controller: 'employees',
      action: 'GetList/ShortDetail',
      queryString: `pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async add(employee:CreateEmployee, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateEmployee> {
    const observable: Observable<CreateEmployee> = this.httpClientService.post<CreateEmployee>({
      controller: 'employees'
    }, employee);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
  async getEmployeeById(employeeId: string, successCallback?: () => void): Promise<SingleEmployee> {
    const observable: Observable<SingleEmployee> = this.httpClientService.get<SingleEmployee>({
      controller: 'employees'
    } , employeeId);

    const employee:SingleEmployee = await firstValueFrom(observable);
    successCallback();
    return employee;
  }

  async update(employee: SingleEmployee,successCallback?: () => void, errorCallback?: (errorMessage: string) => void) {
    const observable: Observable<SingleEmployee> = this.httpClientService.put<SingleEmployee>({
      controller: 'employees'
    }, employee);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
    
  }

  async getEmployeesByDynamicQuery(dynamicQuery: any, pageRequest: PageRequest, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<SingleEmployee>> {
    const observable: Observable<GetListResponse<SingleEmployee>> = this.httpClientService.post<GetListResponse<SingleEmployee>>({
      controller: 'employees',
      action: 'GetList/ByDynamic',
      queryString: `pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    }, dynamicQuery);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

}
