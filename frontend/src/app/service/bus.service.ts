import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  GETBUSDETAILS(departure?: string, arrival?: string, date?: string): Observable<any> {
    let url = `${this.baseUrl}/buses`;
    const params: string[] = [];

    if (departure) params.push(`from=${encodeURIComponent(departure)}`);
    if (arrival) params.push(`to=${encodeURIComponent(arrival)}`);
    if (date) params.push(`date=${encodeURIComponent(date)}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<any>(url).pipe(
      map((res: any) => (res && res.buses ? res.buses : res))
    );
  }

  getbusmongo(userId?: string): Observable<any> {
    const url = userId ? `${this.baseUrl}/bookings?userId=${userId}` : `${this.baseUrl}/bookings`;
    return this.http.get<any>(url).pipe(
      map((res: any) => (res && res.bookings ? res.bookings : res))
    );
  }

  getOperators(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/operators`);
  }

  getRoutes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/routes`);
  }
}