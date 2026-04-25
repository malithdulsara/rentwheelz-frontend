import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CarService } from '../../services/car';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-car-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css',
})
export class CarList implements OnInit {
  cars: any[] = []; 
  displayedCars: any[] = []; 

  isLoading: boolean = true;
  errorMessage: string = '';

  searchTerm: string = '';
  selectedBrand: string = '';
  selectedFuelType: string = '';

  availableBrands: string[] = [];
  availableFuelTypes: string[] = [];

  minPrice: number | null = null;
  maxPrice: number | null = null;

  showAvailableOnly: boolean = false;

  constructor(
    private carService: CarService,
    private cdr: ChangeDetectorRef,
    private router:Router,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    this.fetchCars();
  }

  fetchCars() {
    this.availableFuelTypes = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'];
    this.carService.getAvailableBrands().subscribe({
      next: (brands) => {
        this.availableBrands = brands;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching brands from database', err);
        this.availableBrands = ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'BMW'];
        this.cdr.detectChanges();
      },
    });
    this.applyFilters();
  }

  applyFilters() {
    this.isLoading = true;
    this.cdr.detectChanges(); 

    this.carService
      .getAllCars(
        this.selectedBrand,
        this.selectedFuelType,
        this.searchTerm,
        this.minPrice,
        this.maxPrice,
      )
      .subscribe({
        next: (data: any) => {
          let fetchedCars = [];
          if (Array.isArray(data)) {
            fetchedCars = data;
          } else if (data && data.content) {
            fetchedCars = data.content;
          } else if (data && data.data) {
            fetchedCars = data.data;
          }

          this.cars = fetchedCars;
          this.updateDisplayedCars();

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching cars', err);
          this.errorMessage = 'Failed to load or filter cars.';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedBrand = '';
    this.selectedFuelType = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.showAvailableOnly = false;
    this.applyFilters();
  }

  updateDisplayedCars() {
    if (this.showAvailableOnly) {
      this.displayedCars = this.cars.filter(car => car.status === 'AVAILABLE');
    } else {
      this.displayedCars = [...this.cars]; 
    }
    this.cdr.detectChanges(); 
  }

  onToggleChange() {
    this.updateDisplayedCars();
  }
  bookCar(car: any) {
    console.log("Booking initiated for:", car.brand, car.model);
    const id = car.carId || car.id;
    this.router.navigate(['/checkout', id]);
  }

  canBook(): boolean {
    const role = this.authService.getRole(); 
    return role === 'ROLE_CUSTOMER' || role === 'ROLE_ADMIN';
  }
}