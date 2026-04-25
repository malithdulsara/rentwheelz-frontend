import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  users: any[] = [];
  isLoading: boolean = false;
  
  selectedRole: string = 'ALL'; 
  searchText: string = '';
  currentPage: number = 0; 
  pageSize: number = 5;    
  totalPages: number = 0;
  totalItems: number = 0;
  isEditMode: boolean = false;
  currentEditingUserId: number | null = null;


  isAddManagerModalOpen: boolean = false;
  managerForm!: FormGroup;
  isSubmitting: boolean = false;

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initForm();
    this.loadUsers();
  }

  initForm() {
    this.managerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      contactNumber: ['', Validators.required],
      address: ['', Validators.required],
      role: ['ROLE_FLEET_MANAGER']
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.cdr.detectChanges();

    const url = `http://localhost:8080/api/users/admin/paginated?role=${this.selectedRole}&search=${this.searchText}&page=${this.currentPage}&size=${this.pageSize}`;

    this.http.get<any>(url, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.users = res.users;
          this.totalPages = res.totalPages;
          this.totalItems = res.totalItems;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching users:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadUsers();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  openManagerModal() {
    this.isEditMode = false;
    this.currentEditingUserId = null;
    
    this.managerForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.managerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.managerForm.get('email')?.updateValueAndValidity();
    this.managerForm.get('password')?.updateValueAndValidity();

    this.managerForm.reset({ role: 'ROLE_FLEET_MANAGER' });
    this.isAddManagerModalOpen = true;
  }

  openEditModal(user: any) {
    this.isEditMode = true;
    this.currentEditingUserId = user.user_id;

    this.managerForm.get('email')?.clearValidators();
    this.managerForm.get('password')?.clearValidators();
    this.managerForm.get('email')?.updateValueAndValidity();
    this.managerForm.get('password')?.updateValueAndValidity();

    this.managerForm.patchValue({
      fullName: user.full_name,
      contactNumber: user.contact_number,
      address: user.address,
      role: user.role
    });

    this.isAddManagerModalOpen = true;
  }

  closeManagerModal() {
    this.isAddManagerModalOpen = false;
  }

  // SweetAlert2 - Add / Update Manager

  onSubmitManager() {
    if (this.managerForm.invalid) return;

    this.isSubmitting = true;
    this.cdr.detectChanges();

    if (this.isEditMode && this.currentEditingUserId) {
      const updateData = {
        fullName: this.managerForm.value.fullName,
        contactNumber: this.managerForm.value.contactNumber,
        address: this.managerForm.value.address
      };

      this.http.put(`http://localhost:8080/api/users/admin/update/${this.currentEditingUserId}`, updateData, 
        { headers: this.getHeaders(), responseType: 'text' })
        .subscribe({
          next: (res) => {
            this.isSubmitting = false;
            this.closeManagerModal();
            this.cdr.detectChanges();
            
            Swal.fire({
              title: 'User Updated!',
              text: res,
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            this.loadUsers(); 
          },
          error: (err) => {
            this.isSubmitting = false;
            this.cdr.detectChanges();
            Swal.fire({
              title: 'Error!',
              text: 'Failed to update user.',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        });

    } else {
      this.http.post('http://localhost:8080/api/users/admin/add-manager', this.managerForm.value, 
        { headers: this.getHeaders(), responseType: 'text' })
        .subscribe({
          next: (res) => {
            this.isSubmitting = false;
            this.closeManagerModal();
            this.cdr.detectChanges();
            
            Swal.fire({
              title: 'Manager Added!',
              text: res,
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            this.loadUsers(); 
          },
          error: (err) => {
            this.isSubmitting = false;
            this.cdr.detectChanges();
            Swal.fire({
              title: 'Error!',
              text: 'Failed to add Manager. Email might already exist.',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        });
    }
  }

  // SweetAlert2 - Block / Unblock User
  toggleUserStatus(userId: number, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const actionText = currentStatus === 'ACTIVE' ? 'BLOCK' : 'UNBLOCK';
    const actionColor = currentStatus === 'ACTIVE' ? '#ef4444' : '#10b981';

    Swal.fire({
      title: `Change Status?`,
      text: `Are you sure you want to ${actionText} this user?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: actionColor,
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Yes, ${actionText} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        
        this.isLoading = true;
        this.cdr.detectChanges();

        this.http.put(`http://localhost:8080/api/users/admin/status/${userId}?status=${newStatus}`, {}, 
          { headers: this.getHeaders(), responseType: 'text' })
          .subscribe({
            next: (res) => {
              Swal.fire({
                title: 'Status Updated!',
                text: res,
                icon: 'success',
                confirmButtonColor: '#10b981'
              });
              this.loadUsers();
            },
            error: (err) => {
              Swal.fire({
                title: 'Error!',
                text: 'Failed to update user status.',
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

  onSearch() {
    this.currentPage = 0;
    this.loadUsers();
  }
}