import { Component } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {

 username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.adminService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/admin/panel']);
      },
      error: (err) => {
        this.error = 'Credenciales incorrectas';
        this.loading = false;
      }
    });
  }
}