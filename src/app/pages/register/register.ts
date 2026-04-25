import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          
          // SweetAlert: Successful Registration
          Swal.fire({
            title: 'Welcome!',
            text: 'Registration Successful! You can now log in.',
            icon: 'success',
            confirmButtonColor: '#10b981', 
            confirmButtonText: 'Go to Login'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },

        error: (err) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          
          if (err.status === 400 || err.status === 409) {
            this.errorMessage = 'Email already exists. Please try logging in.';
            
            Swal.fire({
              title: 'Email Already Exists',
              text: 'This email is already registered! Please use a different email or log in.',
              icon: 'warning',
              confirmButtonColor: '#f59e0b', 
              showCancelButton: true,
              cancelButtonText: 'Close',
              confirmButtonText: 'Go to Login'
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/login']);
              }
            });
            
          } else {
            this.errorMessage = 'Registration failed. Please try again later.';
            
            Swal.fire({
              title: 'Registration Failed!',
              text: 'A server error occurred. Please try again later.',
              icon: 'error',
              confirmButtonColor: '#ef4444' 
            });
          }
          this.cdr.detectChanges();
          console.error(err);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
      
      Swal.fire({
        title: 'Incomplete Form',
        text: 'Please fill in all required fields correctly.',
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }
}