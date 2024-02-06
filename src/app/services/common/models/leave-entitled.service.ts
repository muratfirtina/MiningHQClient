import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { LeaveEntitled } from 'src/app/contracts/leave/leaveEntitled';
import { Observable, firstValueFrom } from 'rxjs';
import { LeaveType } from 'src/app/contracts/leave/leaveType';
import { listLeaveType } from 'src/app/contracts/leave/listLeaveType';
import { EntitledLeaveListByEmployeeId } from 'src/app/contracts/leave/entitledLeaveListByEmployeeId';
import { GetTimekeepingListResponse } from 'src/app/contracts/leave/getTimekeepingListResponse';
import { TimekeepingList } from 'src/app/contracts/leave/timekeepingList';
import { CreateTimekeeping } from 'src/app/contracts/leave/createTimekeeping';
import { CreatedTimekeepingResponse } from 'src/app/contracts/leave/createTimekeepingResponse';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { Timekeeping } from 'src/app/contracts/leave/timekeeping';


@Injectable({
  providedIn: 'root'
})
export class LeaveEntitledService {

  constructor(private httpClientService: HttpClientService) { }

  async add(entitledleaves: LeaveEntitled, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<LeaveEntitled> {
    const observable: Observable<LeaveEntitled> = this.httpClientService.post<LeaveEntitled>({
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

  async listByEmployeeId(employeeId: string, leaveTypeId?: string, startDate?: Date, endDate?: Date, pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<EntitledLeaveListByEmployeeId> {
    let queryString = `&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (leaveTypeId) queryString += `&leaveTypeId=${leaveTypeId}`;
    if (startDate) queryString += `&startDate=${startDate}`;
    if (endDate) queryString += `&endDate=${endDate}`;

    const observable: Observable<EntitledLeaveListByEmployeeId> = this.httpClientService.get<EntitledLeaveListByEmployeeId>({
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

  async create(timekeepingData: CreateTimekeeping, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreatedTimekeepingResponse> {
    const observable: Observable<CreatedTimekeepingResponse> = this.httpClientService.post<CreatedTimekeepingResponse>({
      controller: 'timekeepings'
    }, timekeepingData);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

}
