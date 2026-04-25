import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-booking-management',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './booking-management.html',
  styleUrl: './booking-management.css',
})
export class BookingManagement implements OnInit {
  activeTab: 'PENDING' | 'APPROVED' = 'PENDING';
  
  pendingBookings: any[] = [];
  activeBookings: any[] = [];
  isLoading: boolean = false;

  isReturnModalOpen: boolean = false;
  selectedBooking: any = null;
  returnCarStatus: string = 'AVAILABLE';

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadBookings();
  }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  switchTab(tab: 'PENDING' | 'APPROVED') {
    this.activeTab = tab;
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const endpoint = this.activeTab === 'PENDING' 
      ? 'http://localhost:8080/api/bookings/pending'
      : 'http://localhost:8080/api/bookings/approved';

    this.http.get<any[]>(endpoint, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          if (this.activeTab === 'PENDING') {
            this.pendingBookings = res;
          } else {
            this.activeBookings = res;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching bookings:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }


  approveBooking(bookingId: number, carId: number) {
    Swal.fire({
      title: 'Approve Booking?',
      text: "Are you sure you want to approve this booking request?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Approve it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.cdr.detectChanges();

        this.http.put(`http://localhost:8080/api/bookings/approve/${bookingId}/${carId}`, {}, 
          { headers: this.getHeaders(), responseType: 'text' })
          .subscribe({
            next: (res) => {
              Swal.fire({
                title: 'Approved!',
                text: res,
                icon: 'success',
                confirmButtonColor: '#10b981'
              });
              this.loadBookings();
            },
            error: (err) => {
              Swal.fire({
                title: 'Error!',
                text: 'Failed to approve the booking. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
              });
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
      }
    });
  }


  rejectBooking(bookingId: number, carId: number) {
    Swal.fire({
      title: 'Reject Booking?',
      text: "Are you sure you want to reject this booking? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Reject it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.cdr.detectChanges();

        this.http.put(`http://localhost:8080/api/bookings/reject/${bookingId}/${carId}`, {}, 
          { headers: this.getHeaders(), responseType: 'text' })
          .subscribe({
            next: (res) => {
              Swal.fire({
                title: 'Rejected!',
                text: res,
                icon: 'success',
                confirmButtonColor: '#10b981'
              });
              this.loadBookings();
            },
            error: (err) => {
              Swal.fire({
                title: 'Error!',
                text: 'Failed to reject the booking. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
              });
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
      }
    });
  }

  openReturnModal(booking: any) {
    this.selectedBooking = booking;
    this.returnCarStatus = 'AVAILABLE';
    this.isReturnModalOpen = true;
  }

  closeReturnModal() {
    this.isReturnModalOpen = false;
    this.selectedBooking = null;
  }
  
  submitReturn() {
    if (!this.selectedBooking) return;
    
    this.isLoading = true;
    this.cdr.detectChanges();

    const bookingId = this.selectedBooking.booking_id;
    const carId = this.selectedBooking.car_id;

    this.http.put(`http://localhost:8080/api/bookings/return/${bookingId}/${carId}?carStatus=${this.returnCarStatus}`, {}, 
      { headers: this.getHeaders(), responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.closeReturnModal();
          Swal.fire({
            title: 'Returned Successfully!',
            text: res,
            icon: 'success',
            confirmButtonColor: '#10b981'
          });
          this.loadBookings(); 
        },
        error: (err) => {
          Swal.fire({
            title: 'Submission Failed!',
            text: err.error || 'Failed to process the return. Please check again.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}