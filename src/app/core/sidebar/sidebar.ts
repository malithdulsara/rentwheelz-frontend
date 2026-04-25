import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
userRole: string | null = '';

  constructor(private authService: Auth) {
    this.userRole = this.authService.getRole();
  }

  shouldShow(allowedRoles: string[]): boolean {
    return !allowedRoles.length || (this.userRole !== null && allowedRoles.includes(this.userRole));
  }
}
