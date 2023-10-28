import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { ListEmployee } from 'src/app/contracts/employee/list-employee';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListEmployee> {
    const observable: Observable<ListEmployee> = this.httpClientService.get<ListEmployee>({
      controller: 'employees',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
