import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
 stats: any = {
    totalCustomers: 0,
    totalManagers: 0,
    totalCars: 0,
    activeBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: [],
    recentBookings: [] 
  };
  isLoading: boolean = true;
  chart: any; 

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.fetchDashboardStats();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
  }

  fetchDashboardStats() {
    this.http.get<any>('http://localhost:8080/api/dashboard/admin-stats', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.isLoading = false;

          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.renderChart();
          }, 100);
        },
        error: (err) => {
          console.error('Failed to load dashboard stats', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    
    if (!ctx) {
      console.error("There's a problem! The canvas can't be found.");
      return;
    }

    this.chart = new Chart(ctx, {
      type: 'bar', 
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Monthly Revenue (Rs)',
          data: this.stats.monthlyRevenue || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
          backgroundColor: '#10b981', 
          borderRadius: 6, 
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false } 
        }
      }
    });
  }
}
