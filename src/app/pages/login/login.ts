import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

onSubmit() {
  if (this.loginForm.valid) {
    this.isLoading = true;
    this.errorMessage = ''; // අලුතින් Login වෙන්න යද්දී පරණ Error මකනවා
    this.cdr.detectChanges();
    
    this.authService.login(this.loginForm.value).subscribe({
    next: (response) => {
        const role = this.authService.getRole(); 
        
        if (role === 'ROLE_ADMIN') {
          this.router.navigate(['/dashboard']); 
        } 
        else if (role === 'ROLE_FLEET_MANAGER') {
          this.router.navigate(['/inventory']); 
        } 
        else if (role === 'ROLE_CUSTOMER') {
          this.router.navigate(['/cars']);
        } 
        else {
          this.router.navigate(['/cars']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        
        // Backend එකෙන් යවන්නේ {"error": "..."} නිසා, අපි err.error.error එක ගන්නවා
        if (err.error && typeof err.error.error === 'string') {
          this.errorMessage = err.error.error; 
        } 
        else if (err.error && typeof err.error.message === 'string') {
          this.errorMessage = err.error.message; 
        } 
        else if (typeof err.error === 'string') {
          this.errorMessage = err.error; 
        } 
        else {
          this.errorMessage = 'Invalid email or password'; 
        }
        
        this.cdr.detectChanges(); 
        
        console.error('Full Error Object:', err);
      }
    });
  }
}
}
