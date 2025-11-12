import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  QuarryModerator, 
  CreateQuarryModerator, 
  UserQuarriesResponse 
} from 'src/app/contracts/quarryModerator/quarryModerator';

interface ListResponse<T> {
  items: T[];
  count: number;
  index: number;
  size: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuarryModeratorService {
  private apiUrl = `${environment.apiUrl}/quarrymoderators`;

  constructor(private http: HttpClient) { }

  getAllAssignments(pageIndex: number = 0, pageSize: number = 1000): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.apiUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  }

  assignQuarryToModerator(data: CreateQuarryModerator): Observable<QuarryModerator> {
    return this.http.post<QuarryModerator>(this.apiUrl, data);
  }

  removeQuarryFromModerator(userId: string, quarryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}?userId=${userId}&quarryId=${quarryId}`);
  }

  getUserQuarries(userId: string): Observable<UserQuarriesResponse> {
    return this.http.get<UserQuarriesResponse>(`${this.apiUrl}/user/${userId}`);
  }
}
