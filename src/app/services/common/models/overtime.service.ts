import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { OvertimeAdd } from 'src/app/contracts/overtime/overtimeAdd';
import { OvertimeUpdate } from 'src/app/contracts/overtime/overtimeUpdate';
import { OvertimeDelete } from 'src/app/contracts/overtime/overtimeDelete';
import { Observable, firstValueFrom } from 'rxjs';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { Overtime } from 'src/app/contracts/overtime/overtime';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { OvertimeList } from 'src/app/contracts/overtime/overtimeList';

@Injectable({
  providedIn: 'root'
})
export class OvertimeService {

  constructor( private httpClientService: HttpClientService) { }

  async overTimeAdd(overTimeAdd:OvertimeAdd, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<OvertimeAdd> {
    const observable = this.httpClientService.post<OvertimeAdd>({
      controller: 'Overtimes',
    }, overTimeAdd);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }

  async overTimeUpdate(overTimeUpdate:OvertimeUpdate, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<OvertimeUpdate> {
    const observable = this.httpClientService.put<OvertimeUpdate>({
      controller: 'Overtimes',
    }, overTimeUpdate);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }

  async overTimeDelete(id:string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<OvertimeDelete> {
    const observable = this.httpClientService.delete<OvertimeDelete>({
      controller: 'Overtimes',
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }

  async overTimeGetListByEmployeeId(employeeId:string, startDate?:Date, endDate?:Date, pageRequest?:PageRequest, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<OvertimeList>> {
    const observable:Observable<GetListResponse<OvertimeList>> = this.httpClientService.get<GetListResponse<OvertimeList>>({
      controller: 'Overtimes',
      action: 'GetList/ByEmployeeId',
      queryString: `employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}&pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }

  

  async overtimeGetByDynamicQuery(dynamicQuery: any, pageRequest:PageRequest, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<Overtime>> {
    const observable:Observable<GetListResponse<Overtime>> = this.httpClientService.post<GetListResponse<Overtime>>({
      controller: 'Overtimes',
      action: 'GetList/ByDynamic',
      queryString: `&pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    }, dynamicQuery);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback).catch(errorCallback);
    return await promiseData;
  }
}
