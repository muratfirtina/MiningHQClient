import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';

import { Observable, firstValueFrom } from 'rxjs';
import { listLeaveType } from 'src/app/contracts/leave/listLeaveType';
import { TimekeepingList } from 'src/app/contracts/leave/timekeepingList';
import { CreateTimekeeping } from 'src/app/contracts/leave/createTimekeeping';
import { CreatedTimekeepingResponse } from 'src/app/contracts/leave/createTimekeepingResponse';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { LeaveEntitledUsage } from 'src/app/contracts/leave/leaveEntitledUsage';
import { LeaveEntitledAdd } from 'src/app/contracts/leave/leaveEntitledAdd';
import { Employee } from 'src/app/contracts/employee/employee';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { RemainingDays } from 'src/app/contracts/leave/remainingDays';
import { LeaveEntitleds } from 'src/app/contracts/leave/leaveEntitleds';


@Injectable({
  providedIn: 'root'
})
export class LeaveEntitledService {

  constructor(private httpClientService: HttpClientService) { }

  async add(entitledleaves: LeaveEntitledAdd, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<LeaveEntitledAdd> {
    const observable: Observable<LeaveEntitledAdd> = this.httpClientService.post<LeaveEntitledUsage>({
      controller: 'entitledleaves'
    }, entitledleaves);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async listLeaveType(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<listLeaveType> {
    const observable: Observable<listLeaveType> = this.httpClientService.get<listLeaveType>({
      controller: 'leavetypes',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async listByEmployeeId<LeaveEntitled>(employeeId: string, leaveTypeId?: string, startDate?: Date, endDate?: Date, pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<LeaveEntitled>> {
    let queryString = `&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (leaveTypeId) queryString += `&leaveTypeId=${leaveTypeId}`;
    if (startDate) queryString += `&startDate=${startDate}`;
    if (endDate) queryString += `&endDate=${endDate}`;

    const observable: Observable<GetListResponse<LeaveEntitled>> = this.httpClientService.get<GetListResponse<LeaveEntitled>>({
      controller: 'entitledleaves',
      action: "GetListByEmployeeId",
      queryString: queryString
    },employeeId,);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData; 
  }



  async getTimekeepings(year: number, month: number, pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<TimekeepingList>> {
    const pageRequest = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
  
    const observable: Observable<GetListResponse<TimekeepingList>> = this.httpClientService.get<GetListResponse<TimekeepingList>>({
      controller: `timekeepings/${year}/${month}`,
      queryString: pageRequest
    });
  
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData; 
  }

  async addTimekeeping(timekeepingData: CreateTimekeeping, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreatedTimekeepingResponse> {
    const observable: Observable<CreatedTimekeepingResponse> = this.httpClientService.post<CreatedTimekeepingResponse>({
      controller: 'timekeepings'
    }, timekeepingData);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async getEntitledLeavesByDynamicQuery(dynamicQuery: any, pageRequest: PageRequest, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<LeaveEntitledUsage>> {
    const observable: Observable<GetListResponse<LeaveEntitledUsage>> = this.httpClientService.post<GetListResponse<LeaveEntitledUsage>>({
      controller: 'entitledleaves',
      action: 'GetList/ByDynamic',
      queryString: `pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    }, dynamicQuery);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }

  async getRemainingDays(employeeId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<RemainingDays> {
    const observable: Observable<RemainingDays> = this.httpClientService.post<RemainingDays>({
      controller: 'entitledleaves',
      action: 'GetRemainingDays'
    }, {employeeId: employeeId});
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
    
  }

  async deleteEntidledLeave(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<LeaveEntitleds> {
    const observable: Observable<LeaveEntitleds> = this.httpClientService.delete<LeaveEntitleds>({
      controller: 'entitledleaves'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }

}
