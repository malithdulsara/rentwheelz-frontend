import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}
  createBooking(bookingData: any): Observable<string> {
    return this.http.post('http://localhost:8080/api/bookings', bookingData, {
      responseType: 'text',
    });
  }

  getMyBookings(email: string): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:8080/api/bookings/my-bookings/${email}`);
}
}
