import { Component } from '@angular/core';
import { StoryStateService, AppState } from '../../services/story-state.service';

@Component({
  selector: 'app-age-selector',
  standalone: false,
  templateUrl: './age-selector.html',
  styleUrls: ['./age-selector.scss']
})
export class AgeSelectorComponent {
  selectedAge: number | null = null;
  ageGroups = [
    { range: '3-5', label: 'Pequeños Exploradores', color: '#FFB6C1' },
    { range: '6-8', label: 'Aventureros', color: '#87CEEB' },
    { range: '9-12', label: 'Soñadores', color: '#98FB98' }
  ];

  constructor(private storyState: StoryStateService) {}

  selectAge(age: number) {
    this.selectedAge = age;
  }

  continue() {
    if (this.selectedAge) {
      this.storyState.setUserAge(this.selectedAge);
      this.storyState.setState(AppState.STORY_SETUP);
    }

  }

  getAgeGroup(age: number): any {
    if (age >= 3 && age <= 5) return this.ageGroups[0];
    if (age >= 6 && age <= 8) return this.ageGroups[1];
    return this.ageGroups[2];
  }

  isInGroup(age: number, range: string): boolean {
    const parts = range.split('-');
    if (parts.length === 2) {
      const min = parseInt(parts[0], 10);
      const max = parseInt(parts[1], 10);
      return age >= min && age <= max;
    }
    return false;
  }
}