import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { StoryStateService } from '../../../services/story-state.service';
import { LanguageService } from '../../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-story-viewer',
  standalone: false,
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss']
})
export class StoryViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() storyPages: string[] = [];
  @Input() needsInteraction = false;
  @Input() interactionPrompt = '';
  @Input() opciones: string[] = [];
  @Input() isComplete = false;
  @Output() characterSelected = new EventEmitter<string>();
  @Output() restartStory = new EventEmitter<void>();
  
  isMuted = false;
  isSpanish = true;
  characterName = 'Leo';
  private subs = new Subscription();

  currentSpreadIndex = 0;
  isNarrating = false;
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor(
    private storyState: StoryStateService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.goToLastSpread();
    
    this.subs.add(this.storyState.isMuted$.subscribe(muted => {
      this.isMuted = muted;
      if (muted) this.stopNarration();
    }));

    this.subs.add(this.storyState.character$.subscribe(name => {
      if (name) {
        this.characterName = name;
      }
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['storyPages']) {
      const newPages: string[] = changes['storyPages'].currentValue || [];
      if (newPages.length > 0) {
        this.goToLastSpread();
        setTimeout(() => this.narrate(), 300);
      }
    }
  }

  get totalSlots(): number {
    return this.storyPages.length + (this.isComplete ? 1 : 0);
  }

  get totalSpreads(): number {
    return Math.ceil(this.totalSlots / 2);
  }

  goToLastSpread() {
    if (this.totalSpreads > 0) {
      this.currentSpreadIndex = this.totalSpreads - 1;
    } else {
      this.currentSpreadIndex = 0;
    }
  }

  get leftSlotIndex(): number {
    return this.currentSpreadIndex * 2;
  }

  get rightSlotIndex(): number {
    return this.currentSpreadIndex * 2 + 1;
  }

  get leftPageText(): string {
    return this.leftSlotIndex < this.storyPages.length ? this.storyPages[this.leftSlotIndex] : '';
  }

  get rightPageText(): string {
    return this.rightSlotIndex < this.storyPages.length ? this.storyPages[this.rightSlotIndex] : '';
  }

  get isLeftSuccess(): boolean {
    return this.isComplete && this.leftSlotIndex === this.storyPages.length;
  }

  get isRightSuccess(): boolean {
    return this.isComplete && this.rightSlotIndex === this.storyPages.length;
  }

  get showInteractionOnRight(): boolean {
    if (this.isComplete || !this.needsInteraction) return false;
    return this.currentSpreadIndex === Math.floor((this.storyPages.length - 1) / 2);
  }

  nextPage() {
    if (this.currentSpreadIndex < this.totalSpreads - 1) {
      this.currentSpreadIndex++;
      this.narrate();
    }
  }

  prevPage() {
    if (this.currentSpreadIndex > 0) {
      this.currentSpreadIndex--;
      this.narrate();
    }
  }

  narrate() {
    if (this.isMuted) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Narrar texto de izquierda y derecha
      const textToRead = `${this.leftPageText}. ${this.rightPageText}`;
      if (!textToRead.trim()) return;

      this.utterance = new SpeechSynthesisUtterance(textToRead);
      this.utterance.lang = this.isSpanish ? 'es-ES' : 'en-US';
      this.utterance.rate = 0.9;
      this.utterance.pitch = 1.1;
      
      this.utterance.onstart = () => {
        this.isNarrating = true;
      };
      
      this.utterance.onend = () => {
        this.isNarrating = false;
        if (this.showInteractionOnRight) {
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