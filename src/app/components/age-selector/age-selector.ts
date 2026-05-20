import { Component } from '@angular/core';
import { StoryStateService, AppState } from '../../services/story-state.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

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
   message: string = "";
  isSpanish = true;
  private langSub: Subscription | null = null;
  constructor(private storyState: StoryStateService,    private languageService: LanguageService
  ) { this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );}
ngOnInit() {
  // Esperar poquito, luego PREGUNTAR!
  setTimeout(() => {
    const pregunta = new SpeechSynthesisUtterance(this.isSpanish ? "¿Qué edad tienes?" : "How old are you?");
    pregunta.lang = this.isSpanish ? 'es-ES' : 'en-US';
    pregunta.rate = 0.9;
    pregunta.pitch = 1.3;
    
    window.speechSynthesis.speak(pregunta);
  }, 500); // Medio segundo esperar
}
  selectAge(age: number) {
    this.selectedAge = age;
  }
getText(es: string, en: string): string {
      return this.isSpanish ? es : en;
    }
  continue() {
    if (this.selectedAge && this.selectedAge >= 3 && this.selectedAge <= 12) {
      this.storyState.setUserAge(this.selectedAge);
      this.storyState.setState(AppState.STORY_SETUP);
    }
    else {
      
      this.message = this.isSpanish ? "Por favor, introduce un número entre 3 y 12" : "Please enter a number between 3 and 12";
      const pregunta = new SpeechSynthesisUtterance(this.message);
      pregunta.lang = this.isSpanish ? 'es-ES' : 'en-US';
      pregunta.rate = 0.9;
      pregunta.pitch = 1.3;
      
      window.speechSynthesis.speak(pregunta);
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