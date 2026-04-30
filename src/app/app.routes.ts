import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash';
import { AdminLogin } from './components/admin/admin-login/admin-login';
import { AdminPanel } from './components/admin/admin-panel/admin-panel';

export const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'admin/login', component: AdminLogin },
  { path: 'admin/panel', component: AdminPanel },
  { path: '**', redirectTo: '' }
];
