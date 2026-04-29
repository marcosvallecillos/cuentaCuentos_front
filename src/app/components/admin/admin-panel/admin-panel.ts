import { Component } from '@angular/core';
import { AdminService, StoryStats } from '../../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  imports: [],
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
}