import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CarService } from '../../services/car';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  private carService = inject(CarService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  cars: any[] = [];
  isLoading: boolean = true;


  isAddModalOpen: boolean = false;
  carForm!: FormGroup;
  isSubmitting: boolean = false;

  isEditMode: boolean = false;
  editingCarId: number | null = null;
  originalStatus: string = '';

  searchTerm: string = '';
  filterStatus: string = 'ALL';

  currentPage: number = 1;
  pageSize: number = 8;

  ngOnInit() {
    this.initForm(); 
    this.loadCars();
  }

  initForm() {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      fuelType: ['PETROL', Validators.required],
      seatingCapacity: ['', [Validators.required, Validators.min(1)]],
      pricePerDay: ['', [Validators.required, Validators.min(0)]],
      imageUrl: [''], 
      status: ['AVAILABLE'], 
    });
  }

  loadCars() {
    this.isLoading = true;
    this.carService.getAllCars().subscribe({
      next: (data) => {
        this.cars = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching cars', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openAddCarModal() {
    this.isEditMode = false;
    this.editingCarId = null;
    this.originalStatus = '';
    this.carForm.reset({ fuelType: 'PETROL', status: 'AVAILABLE' }); 
    this.isAddModalOpen = true; 
  }

  closeModal() {
    this.isAddModalOpen = false;
  }

  // SweetAlert2 - Save / Update Car

  onSubmit() {
    if (this.carForm.invalid) return;

    this.isSubmitting = true;
    this.cdr.detectChanges();

    if (this.isEditMode && this.editingCarId) {
      
      this.carService.updateCar(this.editingCarId, this.carForm.value).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadCars();
          this.cdr.detectChanges();
          
          Swal.fire({
            title: 'Updated!',
            text: 'Vehicle updated successfully!',
            icon: 'success',
            confirmButtonColor: '#10b981'
          });
        },
        error: (err) => {
          console.error('Error updating car', err);
          this.isSubmitting = false;
          this.cdr.detectChanges();
          
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update vehicle.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        },
      });
    } else {
      this.carService.saveCar(this.carForm.value).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadCars();
          this.cdr.detectChanges();
          
          Swal.fire({
            title: 'Saved!',
            text: 'Vehicle saved successfully!',
            icon: 'success',
            confirmButtonColor: '#10b981'
          });
        },
        error: (err) => {
          console.error('Error saving car', err);
          this.isSubmitting = false;
          this.cdr.detectChanges();
          
          Swal.fire({
            title: 'Error!',
            text: 'Failed to save vehicle.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        },
      });
    }
  }

  // SweetAlert2 - Delete Car
  deleteCar(id: number, status: string) {
    if (status === 'RENTED' || status === 'ON_HOLD') {
      Swal.fire({
        title: 'Cannot Delete',
        text: `This vehicle is currently ${status}. You cannot delete it. Please resolve the booking first.`,
        icon: 'warning',
        confirmButtonColor: '#f59e0b' 
      });
      return;
    }

    Swal.fire({
      title: 'Delete Vehicle?',
      text: "Are you sure you want to delete this vehicle? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.carService.deleteCar(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Vehicle has been deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            this.loadCars();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error deleting car', err);
            Swal.fire({
              title: 'Cannot Delete!',
              text: 'Could not delete the vehicle. It might be linked to a booking history.',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          },
        });
      }
    });
  }


  openEditCarModal(car: any) {
    if (car.status === 'RENTED' || car.status === 'ON_HOLD') {
      Swal.fire({
        title: 'Cannot Edit',
        text: `This vehicle is currently ${car.status}. You cannot edit its details right now.`,
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    this.isEditMode = true;
    this.editingCarId = car.carId;
    this.originalStatus = car.status;
    this.carForm.patchValue(car);
    this.isAddModalOpen = true;
  }

  get filteredCars() {
    return this.cars.filter((car) => {
      const searchString = (car.brand + ' ' + car.model).toLowerCase();
      const matchesSearch = searchString.includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.filterStatus === 'ALL' || car.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  get paginatedCars() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredCars.slice(startIndex, endIndex);
  }

  get totalPages() {
    return Math.ceil(this.filteredCars.length / this.pageSize);
  }

  get showingFrom() {
    return this.filteredCars.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo() {
    return Math.min(this.currentPage * this.pageSize, this.filteredCars.length);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  onFilterChange() {
    this.currentPage = 1;
  }
}