import { Injectable } from '@angular/core';
import { ListJob } from 'src/app/contracts/job/list-job';
import { HttpClientService } from '../http-client.service';
import { Observable, firstValueFrom } from 'rxjs';
import { CreateJob } from 'src/app/contracts/job/create-job';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private httpClientService: HttpClientService) { }

  async list(pageIndex: number = 0, pageSize: number = 10, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<ListJob> {
    const observable: Observable<ListJob> = this.httpClientService.get<ListJob>({
      controller: 'jobs',
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    });
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }

  async add(job: CreateJob, successCallback?: () => void, errorCallback?: (errorMessage: string) => void): Promise<CreateJob> {
    const observable: Observable<CreateJob> = this.httpClientService.post<CreateJob>({
      controller: 'jobs'
    }, job);
    const promiseData = firstValueFrom(observable);
    promiseData.then(successCallback)
      .catch(errorCallback);
    return await promiseData;
  }
}
