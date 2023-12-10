import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { LeaveEntitled } from 'src/app/contracts/leave/leaveEntitled';
import { Observable, firstValueFrom } from 'rxjs';
import { LeaveType } from 'src/app/contracts/leave/leaveType';
import { listLeaveType } from 'src/app/contracts/leave/listLeaveType';
import { EntitledLeavelistByEmployeeId } from 'src/app/contracts/leave/listByEmployeId';

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

  async listByEmployeeId(employeeId: string, leaveTypeId?: string, startDate?: Date, endDate?: Date, pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<EntitledLeavelistByEmployeeId> {
    let queryString = `employeeId=${employeeId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    if (leaveTypeId) queryString += `&leaveTypeId=${leaveTypeId}`;
    if (startDate) queryString += `&startDate=${startDate}`;
    if (endDate) queryString += `&endDate=${endDate}`;

    const observable: Observable<EntitledLeavelistByEmployeeId> = this.httpClientService.get<EntitledLeavelistByEmployeeId>({
      controller: 'entitledleaves',
      action: "GetListByEmployeeId",
      queryString: queryString
    },employeeId);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData; 
  }

}
