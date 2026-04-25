import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { MainLayout } from './core/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { Inventory } from './pages/inventory/inventory';
import { UserManagement } from './pages/user-management/user-management';
import { CarList } from './pages/car-list/car-list';
import { BookingManagement } from './pages/booking-management/booking-management';
import { Unauthorized } from './pages/unauthorized/unauthorized';
import { Register } from './pages/register/register';
import { Checkout } from './pages/checkout/checkout';
import { MyBookings } from './pages/my-bookings/my-bookings';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: MainLayout,
    canActivateChild: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard, data: { roles: ['ROLE_ADMIN', 'ROLE_FLEET_MANAGER'] } },
      { path: 'inventory', component: Inventory, data: { roles: ['ROLE_FLEET_MANAGER', 'ROLE_ADMIN'] }},
      { path: 'users', component: UserManagement, data: { roles: ['ROLE_ADMIN'] }},
      { path: 'cars', component: CarList },
      {
        path: 'checkout/:id',
        component: Checkout,
        data: { roles: ['ROLE_CUSTOMER', 'ROLE_ADMIN'] },
      },
      {
        path: 'my-bookings',
        component: MyBookings,
        data: { roles: ['ROLE_CUSTOMER'] },
      },
      { path: 'bookings', component: BookingManagement,data: { roles: ['ROLE_ADMIN', 'ROLE_FLEET_MANAGER'] } },
      { path: '', redirectTo: 'cars', pathMatch: 'full' },
    ],
  },

  { path: 'unauthorized', component: Unauthorized },
  { path: '**', redirectTo: 'login' },
];
