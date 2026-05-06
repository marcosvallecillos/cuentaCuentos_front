import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StoryStateService, AppState } from '../../services/story-state.service';
import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-story-setup',
  standalone: false,
  templateUrl: './story-setup.html',
  styleUrl: './story-setup.scss'
})
export class StorySetupComponent implements OnInit {

  ngOnInit() {
    this.getCharacters();
    this.getPlaces();
    this.getEmotions();
  }

  currentStep = 1;
  isSpanish = true;
  

  selectedCharacter = '';
  selectedPlace = '';
  selectedEmotion = '';

  characters: any[] = [];

  places: any[] = [];

  emotions: any[] = [];

  constructor(private storyState: StoryStateService, private languageService: LanguageService, private apiservice: AdminService, private cdr: ChangeDetectorRef) {

 this.languageService.isSpanish$.subscribe(
      isSpanish => this.isSpanish = isSpanish
    );}
    getText(es: string, en: string): string {
      return this.isSpanish ? es : en;
    }

  canContinue(): boolean {
    if (this.currentStep === 1) return !!this.selectedCharacter;
    if (this.currentStep === 2) return !!this.selectedPlace;
    if (this.currentStep === 3) return !!this.selectedEmotion;
    return false;
  }

  nextStep() {
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  finishSetup() {
    this.storyState.setSetupData(
      this.selectedCharacter,
      this.selectedPlace,
      this.selectedEmotion
    );
    this.storyState.setState(AppState.STORY_VIEWING);
  }

  getCharacters(){
    this.apiservice.getCatalogItems('protagonista').subscribe({
      next: (data) => {
        console.log('Personajes',data);
        this.characters = data.map(item => {
          return {
            id: item.id,
            name: item.nombre,
            icon: item.emoji,
            selected: false
          };

        });
        this.cdr.detectChanges();
      },

      
      error: (err) => console.log(err)
    });
  }

  getPlaces(){
    this.apiservice.getCatalogItems('lugar').subscribe({
      next: (data) => {
        console.log('Lugares',data);
        this.places = data.map(item => {
          return {
            id: item.id,
            name: item.nombre,
            icon: item.emoji
          };
        });
      },
      error: (err) => console.error('Error loading places:', err)
    });
  }

  getEmotions(){
    this.apiservice.getCatalogItems('emocion').subscribe({
      next: (data) => {
        console.log('Emociones',data);
        this.emotions = data.map(item => {
          return {
            id: item.id,
            name: item.nombre,
            icon: item.emoji
          };
        });
      },
      error: (err) => console.error('Error loading emotions:', err)
    });
  }
}
