import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { ListEmployee } from 'src/app/contracts/employee/list-employee';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateEmployee } from 'src/app/contracts/employee/create-employee';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { Employee } from 'src/app/contracts/employee/employee';
import { ListImageFile } from 'src/app/contracts/list-image-file';

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
  async getEmployeeById(employeeId: string, successCallback?: () => void,errorCallback?:(errorMessage: string) => void): Promise<SingleEmployee> {
    const observable: Observable<SingleEmployee> = this.httpClientService.get<SingleEmployee>({
      controller: 'employees'
    } , employeeId);

    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
    .catch(errorCallback);
    return await promiseData;
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

  async uploadImage(category:string, employeeId: string,path: string, formFiles: FileList, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<FormData> {
    const formData = new FormData();
    for (let i = 0; i < formFiles.length; i++) {
      formData.append(`files`, formFiles[i]);
    }
    formData.append('path', path);
    formData.append('employeeId', employeeId);
    formData.append('category', category);
    const observable: Observable<FormData> = this.httpClientService.post<FormData>({
      controller: 'employees',
      action: 'Upload'
    }, formData,);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getEmployeeFiles(employeeId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListImageFile[]> {
    const observable: Observable<ListImageFile[]> = this.httpClientService.get<ListImageFile[]>({
      controller: 'employees',
      action: 'GetImagesByEmployeeId'
    }, employeeId);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async changeShowcase(employeeId: string, fileId: string, showcase: boolean, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<void> {
    const observable: Observable<void> = this.httpClientService.get<void>({
      controller: 'employees',
      action: 'ChangeShowcase',
      queryString: `employeeId=${employeeId}&fileId=${fileId}&showcase=${showcase}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async uploadImageForEmployee(category:string, employeeId: string,path: string, formFile: File, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<FormData> {
    const formData = new FormData();
    formData.append('file', formFile);
    formData.append('path', path);
    formData.append('employeeId', employeeId);
    formData.append('category', category);
    const observable: Observable<FormData> = this.httpClientService.post<FormData>({
      controller: 'employees',
      action: 'UploadEmployeePhoto'
    }, formData);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getEmployeePhoto(employeeId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListImageFile> {
    const observable: Observable<ListImageFile> = this.httpClientService.get<ListImageFile>({
      controller: 'employees',
      action: 'GetEmployeePhoto'
    }, employeeId);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
  
}
