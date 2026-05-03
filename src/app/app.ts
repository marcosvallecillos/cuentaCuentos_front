import { Component, OnInit } from '@angular/core';
import { AppState, StoryStateService } from './services/story-state.service';
import { ApiService } from './services/api.service';
import { LanguageService } from './services/language.service';
import { filter, take, map, startWith, finalize, timeout, catchError } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, of } from 'rxjs';

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
  
  // User settings
  isSpanish = true;
  isMuted = false;
  selectedAgeRange = '';

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
    private router: Router,
    private languageService: LanguageService
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

    this.languageService.isSpanish$.subscribe(isSp => this.isSpanish = isSp);
    this.storyState.isMuted$.subscribe(muted => this.isMuted = muted);
    
    this.storyState.userAge$.subscribe(age => {
      if (!age) {
        this.selectedAgeRange = '';
      } else if (age <= 5) {
        this.selectedAgeRange = '3-5';
      } else if (age <= 8) {
        this.selectedAgeRange = '6-8';
      } else {
        this.selectedAgeRange = '9-12';
      }
    });

    this.storyState.currentState$.pipe(
      filter(state => state === AppState.STORY_VIEWING && this.storyPages.length === 0),
      take(1)
    ).subscribe(() => {
      this.generateInitialStory();
    });
  }

  toggleMute() {
    this.storyState.toggleMute();
  }

  generateInitialStory() {
    const userAge = this.storyState.getUserAge();
    const { character, place, emotion } = this.storyState.getSetupData();
    if (!userAge || !character) {
      console.warn('Faltan datos para generar historia:', { userAge, character });
      return;
    }

    console.log('🚀 Iniciando generarHistoria...', { character, place, emotion, userAge });
    this.isLoading = true;

    this.api.generarHistoria(character, place, emotion, userAge)
      .pipe(
        timeout(35000), // 35 segundos de timeout
        finalize(() => {
          console.log('🏁 Finalizado flujo generarHistoria');
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('❌ Error capturado en generarHistoria:', err);
          this.storyState.setState(AppState.STORY_SETUP);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (!response) return;
          console.log('✅ Respuesta recibida de generarHistoria:', response);
          
          const pageText = this.cleanText(response.historia);
          if (!pageText) {
            console.warn('⚠️ La historia recibida está vacía');
          }
          
          this.storyPages = [pageText];
          this.needsInteraction = response.necesita_interaccion;
          this.interactionPrompt = response.prompt_interaccion || '';
          this.currentOptions = response.opciones || [];
          this.isComplete = response.progreso.completado;
          
          this.storyState.appendToStory(pageText);
        }
      });
  }

  onCharacterSelected(newCharacter: string) {
    const userAge = this.storyState.getUserAge();
    if (!userAge) return;

    console.log('🚀 Continuando historia con:', newCharacter);
    this.isLoading = true;
    this.storyState.incrementInteraction();
    const interactionNum = this.storyState.getInteractionCount();
    
    const fullContext = this.storyPages.join('\n\n');

    this.api.continuarHistoria(fullContext, newCharacter, userAge, interactionNum)
      .pipe(
        timeout(35000),
        finalize(() => {
          console.log('🏁 Finalizado flujo continuarHistoria');
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('❌ Error capturado en continuarHistoria:', err);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (!response) return;
          console.log('✅ Respuesta recibida de continuarHistoria:', response);
          
          const pageText = this.cleanText(response.historia);
          this.storyPages.push(pageText);
          this.needsInteraction = response.necesita_interaccion;
          this.interactionPrompt = response.prompt_interaccion || '';
          this.currentOptions = response.opciones || [];
          this.isComplete = response.progreso.completado;
          
          this.storyState.appendToStory(pageText);
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