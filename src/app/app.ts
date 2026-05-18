import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AppState, StoryStateService } from './services/story-state.service';
import { ApiService } from './services/api.service';
import { LanguageService } from './services/language.service';
import { filter, map, startWith, finalize, timeout, catchError, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
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
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
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

    this.subs.add(this.languageService.isSpanish$.subscribe(isSp => this.isSpanish = isSp));
    this.subs.add(this.storyState.isMuted$.subscribe(muted => this.isMuted = muted));
    
    this.subs.add(this.storyState.userAge$.subscribe(age => {
      if (!age) {
        this.selectedAgeRange = '';
      } else if (age <= 5) {
        this.selectedAgeRange = '3-5';
      } else if (age <= 8) {
        this.selectedAgeRange = '6-8';
      } else {
        this.selectedAgeRange = '9-12';
      }
    }));

    // Escucha CADA VEZ que se entra al estado STORY_VIEWING con páginas vacías
    // distinctUntilChanged evita disparos duplicados, pero sí reacciona a cada nueva transición
    this.subs.add(
      this.storyState.currentState$.pipe(
        distinctUntilChanged()
      ).subscribe(state => {
        if (state === AppState.STORY_VIEWING && this.storyPages.length === 0 && !this.isLoading) {
          this.generateInitialStory();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
        timeout(30000), // 30 segundos de timeout
        catchError(err => {
          console.error('❌ Error capturado en generarHistoria:', err);
          return of(null);
        }),
        finalize(() => {
          console.log('🏁 Finalizado flujo generarHistoria');
          this.isLoading = false; // Siempre se ejecuta: éxito, error o timeout
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (!response) {
            console.warn('⚠️ Respuesta nula, volviendo al setup');
            this.storyState.setState(AppState.STORY_SETUP);
            this.cdr.detectChanges();
            return;
          }
          console.log('✅ Respuesta recibida de generarHistoria:', response);
          
          try {
            const pageText = this.cleanText(response.historia);
            if (!pageText) {
              console.warn('⚠️ La historia recibida está vacía');
            }
            
            this.storyPages = [pageText];
            this.needsInteraction = response.necesita_interaccion;
            this.interactionPrompt = response.prompt_interaccion || '';
            this.currentOptions = response.opciones || [];
            this.isComplete = response.progreso?.completado ?? false;
            
            this.storyState.appendToStory(pageText);
            this.cdr.detectChanges();
          } catch (parseError) {
            console.error('❌ Error procesando respuesta:', parseError);
            this.storyState.setState(AppState.STORY_SETUP);
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          // Seguridad extra: si algo llega aquí, limpiar loading
          console.error('❌ Error en subscribe (no debería llegar aquí):', err);
          this.isLoading = false;
          this.storyState.setState(AppState.STORY_SETUP);
          this.cdr.detectChanges();
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
        timeout(30000),
        catchError(err => {
          console.error('❌ Error capturado en continuarHistoria:', err);
          return of(null);
        }),
        finalize(() => {
          console.log('🏁 Finalizado flujo continuarHistoria');
          this.isLoading = false; // Siempre se ejecuta
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (!response) return;
          console.log('✅ Respuesta recibida de continuarHistoria:', response);
          
          try {
            const pageText = this.cleanText(response.historia);
            this.storyPages = [...this.storyPages, pageText];
            this.needsInteraction = response.necesita_interaccion;
            this.interactionPrompt = response.prompt_interaccion || '';
            this.currentOptions = response.opciones || [];
            this.isComplete = response.progreso?.completado ?? false;
            
            this.storyState.appendToStory(pageText);
            this.cdr.detectChanges();
          } catch (parseError) {
            console.error('❌ Error procesando continuación:', parseError);
          }
        },
        error: (err) => {
          console.error('❌ Error en subscribe continuarHistoria:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
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