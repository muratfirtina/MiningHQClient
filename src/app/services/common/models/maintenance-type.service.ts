import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { MaintenanceType } from 'src/app/contracts/maintenance/maintenance-type';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { GetListResponse } from 'src/app/contracts/getListResponse';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceTypeService {

  constructor(private httpClientService: HttpClientService) { }

  // Get all maintenance types
  async list(pageIndex: number, pageSize: number): Promise<GetListResponse<MaintenanceType>> {
    const observable = this.httpClientService.get<GetListResponse<MaintenanceType>>({
      controller: "maintenancetypes",
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    
    return firstValueFrom(observable);
  }

  // Get maintenance type by id
  async getById(id: string): Promise<MaintenanceType> {
    const observable: Observable<MaintenanceType> = this.httpClientService.get<MaintenanceType>({
      controller: "maintenancetypes",
    }, id);

    return firstValueFrom(observable);
  }
}
