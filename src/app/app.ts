import { Component, OnInit } from '@angular/core';
import { AppState, StoryStateService } from './services/story-state.service';
import { ApiService } from './services/api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  AppState = AppState;

  // Story data
  currentStoryText = '';
  needsInteraction = false;
  interactionPrompt = '';
  currentOptions: string[] = [];
  isComplete = false;
  isLoading = false;
  currentState$!: any;

  constructor(
    private storyState: StoryStateService,
    private api: ApiService
  ) {
    this.currentState$ = this.storyState.currentState$;
  }

  ngOnInit() {
    this.storyState.reset();

    // Listen for transitions to STORY_VIEWING to trigger the initial story generation
    this.storyState.currentState$.pipe(
      filter(state => state === AppState.STORY_VIEWING && this.currentStoryText === '')
    ).subscribe(() => {
      this.generateInitialStory();
    });
  }

  generateInitialStory() {
    const userAge = this.storyState.getUserAge();
    const { character, place, emotion } = this.storyState.getSetupData();
    if (!userAge || !character) return;

    this.isLoading = true;

    this.api.generarHistoria(character, place, emotion, userAge).subscribe({
      next: (response) => {
        this.currentStoryText = response.historia;
        this.needsInteraction = response.necesita_interaccion;
        this.interactionPrompt = response.prompt_interaccion || '';
        this.currentOptions = response.opciones || [];
        this.isComplete = response.progreso.completado;
        
        this.storyState.appendToStory(response.historia);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al generar la historia. Intenta de nuevo.');
        this.isLoading = false;
        this.storyState.setState(AppState.STORY_SETUP);
      }
    });
  }

  // When the story pauses and the child needs to pick a new character
  onReadyForNextChoice() {
    // This will be handled inside StoryViewer component for selection
    // For now we just stay in STORY_VIEWING but show a selection UI
  }

  // Called from StoryViewer when a new character is selected during interaction
  onCharacterSelected(newCharacter: string) {
    const userAge = this.storyState.getUserAge();
    const { character } = this.storyState.getSetupData(); // Character is irrelevant here but good context
    if (!userAge) return;

    this.isLoading = true;
    this.storyState.incrementInteraction();
    const interactionNum = this.storyState.getInteractionCount();

    this.api.continuarHistoria(this.currentStoryText, newCharacter, userAge, interactionNum).subscribe({
      next: (response) => {
        this.currentStoryText = response.historia;
        this.needsInteraction = response.necesita_interaccion;
        this.interactionPrompt = response.prompt_interaccion || '';
        this.currentOptions = response.opciones || [];
        this.isComplete = response.progreso.completado;
        
        this.storyState.appendToStory(response.historia);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al continuar la historia.');
        this.isLoading = false;
      }
    });
  }

  onRestartStory() {
    this.storyState.reset();
    this.currentStoryText = '';
    this.needsInteraction = false;
    this.interactionPrompt = '';
    this.isComplete = false;
  }
}