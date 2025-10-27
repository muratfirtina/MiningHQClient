import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { Maintenance } from 'src/app/contracts/maintenance/maintenance';
import { CreateMaintenance } from 'src/app/contracts/maintenance/create-maintenance';
import { MaintenanceFile } from 'src/app/contracts/maintenance/maintenance-file';
import { MaintenanceSchedule } from 'src/app/contracts/maintenance/maintenance-schedule';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { GetListResponse } from 'src/app/contracts/getListResponse';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(private httpClientService: HttpClientService) { }

  // Create maintenance - returns the created maintenance with ID
  async create(maintenance: CreateMaintenance): Promise<any> {
    const observable = this.httpClientService.post<CreateMaintenance>({
      controller: "maintenances"
    }, maintenance);

    return firstValueFrom(observable);
  }

  // Get maintenance by id
  getById(id: string): Promise<Maintenance> {
    const observable: Observable<Maintenance> = this.httpClientService.get<Maintenance>({
      controller: "maintenances",
    }, id);

    return firstValueFrom(observable);
  }

  // Get all maintenances
  getList(pageRequest: PageRequest, successCallBack?: () => void, errorCallBack?: (error: any) => void): Observable<GetListResponse<Maintenance>> {
    const observable = this.httpClientService.get<GetListResponse<Maintenance>>({
      controller: "maintenances",
      queryString: `pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    });

    observable.subscribe({
      next: successCallBack,
      error: errorCallBack
    });

    return observable;
  }

  // Get maintenances by machine id
  getByMachineId(machineId: string, pageRequest: PageRequest): Observable<GetListResponse<Maintenance>> {
    return this.httpClientService.get<GetListResponse<Maintenance>>({
      controller: "maintenances",
      action: `machine/${machineId}`,
      queryString: `pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    });
  }

  // Upload maintenance files
  async uploadMaintenanceFiles(maintenanceId: string, files: File[], category: string = "maintenance-documents"): Promise<any> {
    const formData = new FormData();
    formData.append('MaintenanceId', maintenanceId);
    formData.append('Category', category);
    formData.append('FolderPath', `maintenance-files/${maintenanceId}`);
    
    files.forEach(file => {
      formData.append('Files', file, file.name);
    });

    const observable = this.httpClientService.post({
      controller: "maintenances",
      action: "upload"
    }, formData);

    return firstValueFrom(observable);
  }

  // Get maintenance files
  async getMaintenanceFiles(maintenanceId: string): Promise<MaintenanceFile[]> {
    const observable: Observable<MaintenanceFile[]> = this.httpClientService.get<MaintenanceFile[]>({
      controller: "maintenances",
      action: `${maintenanceId}/files`
    });

    return firstValueFrom(observable);
  }

  // Delete maintenance
  delete(id: string, successCallBack?: () => void, errorCallBack?: (error: any) => void): Observable<any> {
    const observable = this.httpClientService.delete({
      controller: "maintenances"
    }, id);

    observable.subscribe({
      next: successCallBack,
      error: errorCallBack
    });

    return observable;
  }

  // Get maintenance schedule for all machines
  getMaintenanceSchedule(pageRequest: PageRequest): Observable<GetListResponse<MaintenanceSchedule>> {
    return this.httpClientService.get<GetListResponse<MaintenanceSchedule>>({
      controller: "maintenances",
      action: "schedule",
      queryString: `pageIndex=${pageRequest.pageIndex}&pageSize=${pageRequest.pageSize}`
    });
  }
}
