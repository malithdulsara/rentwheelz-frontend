import { Component } from '@angular/core';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
userRole: string | null = '';

constructor(private authService: Auth) {
  this.userRole = this.authService.getRole();
}

logout() {
  this.authService.logout();
}
}
