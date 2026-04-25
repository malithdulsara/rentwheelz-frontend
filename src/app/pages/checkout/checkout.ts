import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarService } from '../../services/car';
import { Auth } from '../../services/auth';
import { BookingService } from '../../services/booking';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  bookingForm: FormGroup;
  carId: string | null = null;
  carDetails: any = null;
  totalPrice: number = 0;
  totalDays: number = 0;
  isLoading: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  private carService = inject(CarService);
  private authService = inject(Auth);
  private bookingService = inject(BookingService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.bookingForm = this.fb.group({
      pickupDate: ['', Validators.required],
      dropoffDate: ['', Validators.required],
    });

    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('id');

    if (this.carId) {
      this.loadCarDetails(this.carId);
    } else {
      this.router.navigate(['/cars']);
    }
  }

  loadCarDetails(id: string) {
    this.isLoading = true;

    this.carService.getCarById(id).subscribe({
      next: (res) => {
        this.carDetails = res;
        this.isLoading = false;
        this.cdr.detectChanges();

        this.calculateTotal();
      },
      error: (err) => {
        console.error('Error fetching car details', err);
        this.isLoading = false;
        
        // SweetAlert: Car Details Load Error
        Swal.fire({
          title: 'Oops!',
          text: 'Could not load car details. Returning to catalog.',
          icon: 'error',
          confirmButtonColor: '#3b82f6' 
        }).then(() => {
          this.router.navigate(['/cars']);
        });
      },
    });
  }

  calculateTotal() {
    const pickup = this.bookingForm.get('pickupDate')?.value;
    const dropoff = this.bookingForm.get('dropoffDate')?.value;

    if (pickup && dropoff && this.carDetails) {
      const start = new Date(pickup);
      const end = new Date(dropoff);

      if (end < start) {
        this.totalPrice = 0;
        this.totalDays = 0;
        return;
      }

      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      this.totalDays = diffDays === 0 ? 1 : diffDays;
      const dailyPrice = Number(this.carDetails.pricePerDay); 
      if (!isNaN(dailyPrice)) {
        this.totalPrice = this.totalDays * dailyPrice;
      } else {
        this.totalPrice = 0;
      }
    }
  }

  confirmBooking() {
    if (this.bookingForm.invalid) {
      // SweetAlert: Validation Error
      Swal.fire({
        title: 'Missing Dates',
        text: 'Please select valid Pick-up and Drop-off dates.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b' 
      });
      return;
    }

    this.isLoading = true;

    const bookingData = {
      carId: this.carId,
      customerEmail: this.authService.getUserEmail(),
      pickupDate: this.bookingForm.value.pickupDate,
      returnDate: this.bookingForm.value.dropoffDate,
      totalPrice: this.totalPrice
    };

    console.log('Sending Booking to Backend:', bookingData);

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // SweetAlert: Success Booking
        Swal.fire({
          title: 'Booking Confirmed!',
          text: response, // "Booking request sent and car is now on hold."
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'View My Bookings'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/my-bookings']);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Booking Error:', err);
        
        // SweetAlert: Booking Failed Error
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#ef4444' 
        });
      },
    });
  }
}