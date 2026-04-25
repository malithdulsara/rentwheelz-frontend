import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private apiUrl = 'http://localhost:8080/api/cars';

  constructor(private http: HttpClient) {}

  getAllCars(
    brand?: string,
    fuelType?: string,
    search?: string,
    minPrice?: number | null,
    maxPrice?: number | null,
  ): Observable<any> {
    let params = new HttpParams();

    if (brand) params = params.set('brand', brand);
    if (fuelType) params = params.set('fuelType', fuelType);
    if (search) params = params.set('search', search);
    if (minPrice) params = params.set('minPrice', minPrice);
    if (maxPrice) params = params.set('maxPrice', maxPrice);

    return this.http.get(this.apiUrl, { params });
  }

  saveCar(car: Car): Observable<any> {
    return this.http.post(this.apiUrl, car, { responseType: 'text' as 'json' });
  }

  getAvailableBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`);
  }

  deleteCar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  updateCar(id: number, carData: any) {
    return this.http.put(`${this.apiUrl}/${id}`, carData, { responseType: 'text' as 'json' });
  }
  getCarById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
