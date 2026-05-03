import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { StoryStateService } from '../../../services/story-state.service';
import { LanguageService } from '../../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-story-viewer',
  standalone: false,
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss']
})
export class StoryViewerComponent implements OnInit {
  @Input() storyPages: string[] = [];
  @Input() needsInteraction = false;
  @Input() interactionPrompt = '';
  @Input() opciones: string[] = [];
  @Input() isComplete = false;
  @Output() characterSelected = new EventEmitter<string>();
  @Output() restartStory = new EventEmitter<void>();
  
  isMuted = false;
  isSpanish = true;
  private subs = new Subscription();

  currentPageIndex = 0;
  isNarrating = false;
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor(
    private storyState: StoryStateService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.currentPageIndex = this.storyPages.length - 1;
    
    this.subs.add(this.storyState.isMuted$.subscribe(muted => {
      this.isMuted = muted;
      if (muted) this.stopNarration();
    }));

    this.subs.add(this.languageService.isSpanish$.subscribe(isSp => {
      this.isSpanish = isSp;
    }));

    setTimeout(() => this.narrate(), 500);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.stopNarration();
  }

  ngOnChanges() {
    // Si se añade una nueva página, vamos a ella y narramos
    if (this.storyPages.length > this.currentPageIndex + 1) {
      this.currentPageIndex = this.storyPages.length - 1;
      this.narrate();
    }
  }

  get currentStoryPage(): string {
    return this.storyPages[this.currentPageIndex] || '';
  }

  nextPage() {
    if (this.currentPageIndex < this.storyPages.length - 1) {
      this.currentPageIndex++;
      this.narrate();
    }
  }

  prevPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.narrate();
    }
  }

  narrate() {
    if (this.isMuted) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      this.utterance = new SpeechSynthesisUtterance(this.currentStoryPage);
      this.utterance.lang = this.isSpanish ? 'es-ES' : 'en-US';
      this.utterance.rate = 0.9;
      this.utterance.pitch = 1.1;
      
      this.utterance.onstart = () => {
        this.isNarrating = true;
      };
      
      this.utterance.onend = () => {
        this.isNarrating = false;
        // Solo narramos el prompt si estamos en la última página y se necesita interacción
        if (this.needsInteraction && this.currentPageIndex === this.storyPages.length - 1) {
          this.narratePrompt();
        }
      };
      
      window.speechSynthesis.speak(this.utterance);
    }
  }

  private narratePrompt() {
    if (this.isMuted) return;
    if (this.interactionPrompt) {
      const promptUtterance = new SpeechSynthesisUtterance(this.interactionPrompt);
      promptUtterance.lang = this.isSpanish ? 'es-ES' : 'en-US';
      promptUtterance.rate = 0.85;
      promptUtterance.pitch = 1.2;
      window.speechSynthesis.speak(promptUtterance);
    }
  }

  stopNarration() {
    window.speechSynthesis.cancel();
    this.isNarrating = false;
  }

  onSelectCharacter(name: string) {
    this.stopNarration();
    this.characterSelected.emit(name);
  }

  onRestart() {
    this.stopNarration();
    this.restartStory.emit();
  }
}