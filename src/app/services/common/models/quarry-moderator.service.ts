import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  QuarryModerator, 
  CreateQuarryModerator, 
  UserQuarriesResponse 
} from 'src/app/contracts/quarryModerator/quarryModerator';

@Injectable({
  providedIn: 'root'
})
export class QuarryModeratorService {
  private apiUrl = `${environment.apiUrl}/quarrymoderators`;

  constructor(private http: HttpClient) { }

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
