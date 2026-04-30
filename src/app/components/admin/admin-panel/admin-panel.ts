import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, StoryStats } from '../../../services/admin.service';
import { Router } from '@angular/router';
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

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.adminService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.loadStats();
  }

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  setTab(tab: 'dashboard' | 'stories' | 'catalog') {
    this.activeTab = tab;
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