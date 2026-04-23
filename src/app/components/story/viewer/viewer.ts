import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-story-viewer',
  standalone: false,
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss']
})
export class StoryViewerComponent implements OnInit {
  @Input() storyText = '';
  @Input() needsInteraction = false;
  @Input() interactionPrompt = '';
  @Input() opciones: string[] = [];
  @Input() isComplete = false;
  @Output() characterSelected = new EventEmitter<string>();
  @Output() restartStory = new EventEmitter<void>();

  interactionOptions = [
    { name: 'Ir por el camino de flores', icon: '🌸' },
    { name: 'Hablar con el búho sabio', icon: '🦉' }
  ];

  isNarrating = false;
  private utterance: SpeechSynthesisUtterance | null = null;

  ngOnInit() {
    // Auto-narrar al cargar
    setTimeout(() => this.narrate(), 500);
  }

  narrate() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      this.utterance = new SpeechSynthesisUtterance(this.storyText);
      this.utterance.lang = 'es-ES';
      this.utterance.rate = 0.9;
      this.utterance.pitch = 1.1;
      
      this.utterance.onstart = () => {
        this.isNarrating = true;
      };
      
      this.utterance.onend = () => {
        this.isNarrating = false;
        if (this.needsInteraction) {
          this.narratePrompt();
        }
      };
      
      window.speechSynthesis.speak(this.utterance);
    }
  }

  private narratePrompt() {
    if (this.interactionPrompt) {
      const promptUtterance = new SpeechSynthesisUtterance(this.interactionPrompt);
      promptUtterance.lang = 'es-ES';
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