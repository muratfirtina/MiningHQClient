import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { LeaveUsage } from 'src/app/contracts/leave/leaveUsage/leaveUsage';
import { Observable, first, firstValueFrom } from 'rxjs';
import { LeaveUsageUpdate } from 'src/app/contracts/leave/leaveUsage/leaveUsageUpdate';

@Injectable({
  providedIn: 'root'
})
export class LeaveUsageService {

  constructor(private httpClientService: HttpClientService) { }

  async getLeaveUsagesByDynamicQuery(dynamicQuery: any, pageRequest: PageRequest, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<LeaveUsage>> {
    const observable: Observable<GetListResponse<LeaveUsage>> = this.httpClientService.post<GetListResponse<LeaveUsage>>({
      controller: 'EmployeeLeaveUsages',
      action: 'GetList/ByDynamic',
      queryString: `&pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    }, dynamicQuery);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;;
    
  }

  async addLeaveUsage(leaveUsage: LeaveUsage, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<LeaveUsage> {
    const observable: Observable<LeaveUsage> = this.httpClientService.post<LeaveUsage>({
      controller: 'EmployeeLeaveUsages'
    }, leaveUsage);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }

  async updateLeaveUsage(leaveUsageUpdate: LeaveUsageUpdate, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<LeaveUsageUpdate> {
    const observable: Observable<LeaveUsageUpdate> = this.httpClientService.put<LeaveUsageUpdate>({
      controller: 'EmployeeLeaveUsages'
    }, leaveUsageUpdate);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }

  async deleteLeaveUsage(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<string> {
    const observable: Observable<string> = this.httpClientService.delete<string>({
      controller: 'EmployeeLeaveUsages',
      
    },id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }
}
