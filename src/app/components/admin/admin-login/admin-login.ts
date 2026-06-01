import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';

interface Star {
  x: number;
  y: number;
  opacity: number;
  vx: number;
  vy: number;
  size: number;
}

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin implements OnInit, OnDestroy {

  username = '';
  password = '';
  error = '';
  loading = false;

  stars: Star[] = [];
  private animationFrame: number | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  onMouseMove(event: MouseEvent) {
    const count = 2;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: event.clientX,
        y: event.clientY,
        opacity: 1,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 15 + 10
      });
    }
  }

  private animate() {
    this.stars.forEach(star => {
      star.x += star.vx;
      star.y += star.vy;
      star.opacity -= 0.02;
    });

    this.stars = this.stars.filter(s => s.opacity > 0);
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

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