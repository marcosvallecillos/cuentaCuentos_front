import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Story } from '../../../services/admin.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-story-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './story-history.html',
  styleUrl: './story-history.scss',
})
export class StoryHistory {
  stories: Story[] = [];
  selectedStory: Story | null = null;
  filterGroup: string = '';
  loading = false;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStories();
    this.cdr.detectChanges();
  }

  loadStories() {
    this.loading = true;
    this.cdr.detectChanges();
    console.log('Cargando historias del historial...');
    this.adminService.getStories(0, 100, this.filterGroup || undefined)
      .pipe(finalize(() => {
        console.log('Finalizado carga de historias');
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          console.log('Historias cargadas:', data.length);
          this.stories = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading stories:', err);
          this.cdr.detectChanges();
        }
      });
  }

  viewStory(story: Story) {
    this.adminService.getStory(story.id).subscribe({
      next: (full) => {
        this.selectedStory = full;
      }
    });
  }

  deleteStory(story: Story) {
    if (!confirm(`¿Eliminar la historia #${story.id}?`)) return;

    this.adminService.deleteStory(story.id).subscribe({
      next: () => {
        this.stories = this.stories.filter(s => s.id !== story.id);
        if (this.selectedStory?.id === story.id) {
          this.selectedStory = null;
        }
      }
    });
  }

  closeModal() {
    this.selectedStory = null;
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