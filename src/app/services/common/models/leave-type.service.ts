import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {

  constructor(private httpClientService: HttpClientService) { }

  create(leaveType: Create_LeaveType): Observable<Create_LeaveType> {
    return this.httpClientService.post<Create_LeaveType>({
      controller: "leaveTypes"
    }, leaveType);
  }

  async read(pageIndex: number = 0, pageSize: number = 5, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalLeaveTypeCount: number; leaveTypes: List_LeaveType[] }> {
    const promiseData: Promise<{ totalLeaveTypeCount: number; leaveTypes: List_LeaveType[] }> = this.httpClientService.get<{ totalLeaveTypeCount: number; leaveTypes: List_LeaveType[] }>({
      controller: "leaveTypes",
      queryString: `pageIndex=${pageIndex}&pageSize=${pageSize}`
    }).toPromise() as Promise<{ totalLeaveTypeCount: number; leaveTypes: List_LeaveType[] }>;

    promiseData.then(d => successCallBack && successCallBack())
      .catch((errorResponse: any) => errorCallBack && errorCallBack(errorResponse.error));

    return await promiseData;
  }

  async getAllLeaveTypes(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_LeaveType[]> {
    const promiseData: Promise<{ items: List_LeaveType[] }> = this.httpClientService.get<{ items: List_LeaveType[] }>({
      controller: "leaveTypes",
      queryString: `pageIndex=-1&pageSize=-1`
    }).toPromise() as Promise<{ items: List_LeaveType[] }>;

    promiseData.then(d => successCallBack && successCallBack())
      .catch((errorResponse: any) => errorCallBack && errorCallBack(errorResponse.error));

    const result = await promiseData;
    return result.items;
  }

  async delete(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const deleteObservable: Observable<any> = this.httpClientService.delete<any>({
      controller: "leaveTypes"
    }, id);

    deleteObservable.subscribe({
      next: (value) => {
        successCallBack && successCallBack();
      },
      error: (errorResponse) => {
        errorCallBack && errorCallBack(errorResponse.error);
      }
    });
  }

  async getById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_LeaveType> {
    const promiseData: Promise<List_LeaveType> = this.httpClientService.get<List_LeaveType>({
      controller: "leaveTypes"
    }, id).toPromise() as Promise<List_LeaveType>;

    promiseData.then(d => successCallBack && successCallBack())
      .catch((errorResponse: any) => errorCallBack && errorCallBack(errorResponse.error));

    return await promiseData;
  }

  update(leaveType: Update_LeaveType): Observable<Update_LeaveType> {
    return this.httpClientService.put<Update_LeaveType>({
      controller: "leaveTypes"
    }, leaveType);
  }
}

export class Create_LeaveType {
  name: string;
}

export class Update_LeaveType {
  id: string;
  name: string;
}

export class List_LeaveType {
  id: string;
  name: string;
}