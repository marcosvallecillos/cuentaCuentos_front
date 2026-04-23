import { Component } from '@angular/core';
import { StoryStateService, AppState } from '../../services/story-state.service';

@Component({
  selector: 'app-story-setup',
  standalone: false,
  templateUrl: './story-setup.html',
  styleUrl: './story-setup.scss'
})
export class StorySetupComponent {
  currentStep = 1;

  selectedCharacter = '';
  selectedPlace = '';
  selectedEmotion = '';

  characters = [
    { id: 1, name: 'Leonel el León', icon: '🦁' },
    { id: 2, name: 'Pio el Pollito', icon: '🐥' },
    { id: 3, name: 'Saltos el Conejo', icon: '🐰' },
    { id: 4, name: 'Miau el Gato', icon: '🐱' }
  ];

  places = [
    { id: 1, name: 'El Prado Mágico', icon: '🌸' },
    { id: 2, name: 'El Bosque Susurrante', icon: '🌳' },
    { id: 3, name: 'El Espacio Sideral', icon: '🚀' },
    { id: 4, name: 'Bajo el Mar Azul', icon: '🌊' }
  ];

  emotions = [
    { id: 1, name: 'Muy Feliz', icon: '😊' },
    { id: 2, name: 'Valiente', icon: '⚔️' },
    { id: 3, name: 'Curioso', icon: '🧐' },
    { id: 4, name: 'Divertido', icon: '🤪' }
  ];

  constructor(private storyState: StoryStateService) {}

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
}
