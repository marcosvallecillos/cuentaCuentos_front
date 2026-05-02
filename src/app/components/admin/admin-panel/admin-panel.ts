import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, StoryStats } from '../../../services/admin.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { StoryHistory } from '../story-history/story-history';
import { CatalogManager } from '../catalog-manager/catalog-manager';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, StoryHistory, CatalogManager],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel {

  stats: StoryStats | null = null;
  activeTab: 'dashboard' | 'stories' | 'catalog' = 'dashboard';
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.adminService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadStats();
    this.cdr.detectChanges();
  }

  loadStats() {
    this.isLoading = true;
    this.cdr.detectChanges();
    console.log('Cargando estadísticas del dashboard...');
    this.adminService.getStats()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          console.log('Estadísticas cargadas:', data);
          this.stats = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading stats:', err);
          this.cdr.detectChanges();
        }
      });
  }

  setTab(tab: 'dashboard' | 'stories' | 'catalog') {
    this.activeTab = tab;
    if (tab === 'dashboard') {
      this.loadStats();
    }
  }

  logout() {
    this.adminService.logout();
    this.router.navigate(['/admin/login']);
  }

  getAgeColor(grupo: string): string {
    const colors: any = {
      '3-5': '#FFB6C1',
      '6-8': '#87CEEB',
      '9-12': '#98FB98'
    };
    return colors[grupo] || '#ccc';
  }
}