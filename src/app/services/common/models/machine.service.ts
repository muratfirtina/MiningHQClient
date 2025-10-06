import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateMachine } from 'src/app/contracts/machine/create-machine';
import { UpdateMachine } from 'src/app/contracts/machine/update-machine';
import { Machine } from 'src/app/contracts/machine/machine';
import { MachineStats } from 'src/app/contracts/machine/machine-stats';
import { DynamicQuery } from 'src/app/contracts/dynamic-query';
import { ListImageFile } from 'src/app/contracts/list-image-file';
import { GetListResponse } from 'src/app/contracts/getListResponse';

@Injectable({
  providedIn: 'root'
})
export class MachineService {

  constructor(private httpClientService: HttpClientService) { }

  /**
   * Get paginated list of machines
   */
  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<Machine>> {
    const queryString = `pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
    const observable: Observable<GetListResponse<Machine>> = this.httpClientService.get<GetListResponse<Machine>>({
      controller: 'machines',
      queryString: queryString
    });
    
    const promiseData = firstValueFrom(observable);
    promiseData.then((response) => {
      if (successCallback) successCallback();
    })
      .catch((error) => {
        console.error('Machine API hatası:', error);
        if (errorCallback) errorCallback(error.message || 'Bilinmeyen hata');
      });
    return await promiseData;
  }

  /**
   * Create new machine
   */
  async add(machine: CreateMachine, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateMachine> {
    const observable: Observable<CreateMachine> = this.httpClientService.post<CreateMachine>({
      controller: 'machines'
    }, machine);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Get machine by ID
   */
  async getMachineById(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<Machine> {
    const observable: Observable<Machine> = this.httpClientService.get<Machine>({
      controller: 'machines',
      action: id
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Update machine
   */
  async update(machine: UpdateMachine, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<UpdateMachine> {
    const observable: Observable<UpdateMachine> = this.httpClientService.put<UpdateMachine>({
      controller: 'machines'
    }, machine);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Delete machine
   */
  async delete(id: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<void> {
    const observable: Observable<void> = this.httpClientService.delete({
      controller: 'machines'
    }, id);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Search machines with dynamic query
   */
  async search(dynamicQuery: DynamicQuery, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<GetListResponse<Machine>> {
    const observable: Observable<GetListResponse<Machine>> = this.httpClientService.post<GetListResponse<Machine>>({
      controller: 'machines/search'
    }, dynamicQuery as any);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Get machine files
   */
  async getMachineFiles(machineId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListImageFile[]> {
    const observable: Observable<ListImageFile[]> = this.httpClientService.get<ListImageFile[]>({
      controller: 'machines',
      action: `${machineId}/files`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Upload machine file
   */
  async uploadMachineFile(machineId: string, file: File, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('machineId', machineId);

    const observable: Observable<any> = this.httpClientService.post<any>({
      controller: 'machines',
      action: `${machineId}/files`
    }, formData);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Delete machine file
   */
  async deleteMachineFile(machineId: string, fileId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<void> {
    const observable: Observable<void> = this.httpClientService.delete({
      controller: 'machines',
      action: `${machineId}/files`
    }, fileId);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Get machine statistics
   */
  async getMachineStats(machineId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<MachineStats> {
    const observable: Observable<MachineStats> = this.httpClientService.get<MachineStats>({
      controller: 'machines',
      action: `${machineId}/stats`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Get machine maintenance history
   */
  async getMachineMaintenanceHistory(machineId: string, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any[]> {
    const observable: Observable<any[]> = this.httpClientService.get<any[]>({
      controller: 'machines',
      action: `${machineId}/maintenance`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  /**
   * Get machines summary for dashboard
   */
  async getMachinesSummary(successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<any> {
    const observable: Observable<any> = this.httpClientService.get<any>({
      controller: 'machines/summary'
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
