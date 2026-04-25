import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from '@angular/common/http';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // <--- SweetAlert2 එකතු කළා

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './my-bookings.html',
})
export class MyBookings implements OnInit, OnDestroy {
  bookings: any[] = [];
  isLoading: boolean = false;
  timerInterval: any;

  // Pagination & Filtering Variables
  currentPage: number = 1;
  pageSize: number = 5; 
  totalPages: number = 0;
  totalItems: number = 0;
  selectedStatus: string = 'ALL';

  private http = inject(HttpClient);
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.fetchMyBookings();
    this.timerInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
  }

  fetchMyBookings() {
    const email = this.authService.getUserEmail();
    this.isLoading = true;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('size', this.pageSize.toString())
      .set('status', this.selectedStatus);

    this.http
      .get<any>(`http://localhost:8080/api/bookings/my-bookings/${email}`, {
        headers: this.getHeaders(),
        params: params,
      })
      .subscribe({
        next: (res) => {
          this.bookings = res.bookings || [];
          this.currentPage = res.currentPage || 1;
          this.totalPages = res.totalPages || 0;
          this.totalItems = res.totalItems || 0;

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Fetch Error:', err);
        },
      });
  }

  onFilterChange() {
    this.currentPage = 1; 
    this.fetchMyBookings();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchMyBookings();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchMyBookings();
    }
  }

  getRemainingTime(createdAt: any): { text: string; expired: boolean } {
    if (!createdAt) return { text: '', expired: true };

    const dateStr = createdAt.toString().replace(' ', 'T');
    const createdTime = new Date(dateStr).getTime();

    if (isNaN(createdTime)) {
      return { text: 'Date Error', expired: true };
    }

    const expiryTime = createdTime + 15 * 60 * 1000;
    const now = new Date().getTime();
    const diff = expiryTime - now;

    if (diff <= 0) return { text: 'Time Expired', expired: true };

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;

    return { text: `${minutes}m ${displaySeconds}s remaining`, expired: false };
  }

  onCancel(bookingId: number, carId: number) {
    Swal.fire({
      title: 'Cancel Booking?',
      text: "Are you sure you want to cancel this booking? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#94a3b8',  
      confirmButtonText: 'Yes, Cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.cdr.detectChanges();

        this.http
          .put(
            `http://localhost:8080/api/bookings/cancel/${bookingId}/${carId}`,
            {},
            { headers: this.getHeaders(), responseType: 'text' },
          )
          .subscribe({
            next: (res) => {
              Swal.fire({
                title: 'Cancelled!',
                text: res, 
                icon: 'success',
                confirmButtonColor: '#10b981'
              });
              this.fetchMyBookings();
            },
            error: (err) => {
              console.error('Cancel Error:', err);
              const errorMsg = err.error || 'Cancellation failed. Please try again.';
              
              Swal.fire({
                title: 'Error!',
                text: errorMsg,
                icon: 'error',
                confirmButtonColor: '#ef4444'
              });
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
      }
    });
  }
}