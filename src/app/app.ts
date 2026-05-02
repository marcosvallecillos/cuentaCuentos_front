import { Component, OnInit } from '@angular/core';
import { AppState, StoryStateService } from './services/story-state.service';
import { ApiService } from './services/api.service';
import { filter, take, map, startWith, finalize } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  AppState = AppState;

  // Story data
  storyPages: string[] = [];
  needsInteraction = false;
  interactionPrompt = '';
  currentOptions: string[] = [];
  isComplete = false;
  isLoading = false;
  currentState$!: any;
  isAdminRoute$!: Observable<boolean>;

  cleanText(text: string): string {
    if (!text) return '';
    
    // Primero quitamos cualquier cosa entre corchetes que esté al principio
    let cleaned = text.replace(/^\[[^\]]*\]\s*/, '');
    
    // Quitamos marcas conocidas
    cleaned = cleaned
      .split('[OPCIONES]')[0]
      .split('[PAUSA_INTERACCION]')[0]
      .split('[FIN]')[0]
      .split('[FINAL]')[0]
      .replace(/\[Inicio de la historia\]/gi, '')
      .replace(/\[Continuación del cuento\]/gi, '')
      .replace(/\[Continuacion natural[^\]]*\]/gi, '')
      .replace(/\[NARRATIVA\]/gi, '')
      .replace(/\[Narrativa\]/gi, '')
      .replace(/\[Final del cuento\]/gi, '')
      .trim();

    // Si todavía quedan corchetes residuales (como [NARRATIVA] en medio o algo así)
    cleaned = cleaned.replace(/\[[^\]]*\]/g, '').trim();
    
    return cleaned;
  }

  constructor(
    private storyState: StoryStateService,
    private api: ApiService,
    private router: Router
  ) {
    this.currentState$ = this.storyState.currentState$;
    this.isAdminRoute$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => event.urlAfterRedirects.startsWith('/admin')),
      startWith(window.location.pathname.startsWith('/admin'))
    );
  }

  ngOnInit() {
    this.storyState.reset();

    this.storyState.currentState$.pipe(
      filter(state => state === AppState.STORY_VIEWING && this.storyPages.length === 0),
      take(1)
    ).subscribe(() => {
      this.generateInitialStory();
    });
  }

  generateInitialStory() {
    const userAge = this.storyState.getUserAge();
    const { character, place, emotion } = this.storyState.getSetupData();
    if (!userAge || !character) return;

    console.log('Generando historia inicial...');
    this.isLoading = true;

    this.api.generarHistoria(character, place, emotion, userAge)
      .pipe(finalize(() => {
        console.log('Finalizado generarHistoria');
        this.isLoading = false;
      }))
      .subscribe({
        next: (response) => {
          const pageText = this.cleanText(response.historia);
          this.storyPages = [pageText];
          this.needsInteraction = response.necesita_interaccion;
          this.interactionPrompt = response.prompt_interaccion || '';
          this.currentOptions = response.opciones || [];
          this.isComplete = response.progreso.completado;
          
          this.storyState.appendToStory(pageText);
        },
        error: (error) => {
          console.error('Error generando historia:', error);
          this.storyState.setState(AppState.STORY_SETUP);
        }
      });
  }

  onCharacterSelected(newCharacter: string) {
    const userAge = this.storyState.getUserAge();
    if (!userAge) return;

    console.log('Continuando historia con:', newCharacter);
    this.isLoading = true;
    this.storyState.incrementInteraction();
    const interactionNum = this.storyState.getInteractionCount();
    
    const fullContext = this.storyPages.join('\n\n');

    this.api.continuarHistoria(fullContext, newCharacter, userAge, interactionNum)
      .pipe(finalize(() => {
        console.log('Finalizado continuarHistoria');
        this.isLoading = false;
      }))
      .subscribe({
        next: (response) => {
          const pageText = this.cleanText(response.historia);
          this.storyPages.push(pageText);
          this.needsInteraction = response.necesita_interaccion;
          this.interactionPrompt = response.prompt_interaccion || '';
          this.currentOptions = response.opciones || [];
          this.isComplete = response.progreso.completado;
          
          this.storyState.appendToStory(pageText);
        },
        error: (error) => {
          console.error('Error continuando historia:', error);
        }
      });
  }

  onRestartStory() {
    this.storyState.reset();
    this.storyPages = [];
    this.needsInteraction = false;
    this.interactionPrompt = '';
    this.isComplete = false;
  }
}