import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoryStateService, AppState } from '../../services/story-state.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';

interface Star {
  x: number;
  y: number;
  opacity: number;
  vx: number;
  vy: number;
  size: number;
}

@Component({
  selector: 'app-splash',
  standalone: false,
  templateUrl: './splash.html',
  styleUrl: './splash.scss',
})
export class SplashComponent implements OnInit, OnDestroy {
  stars: Star[] = [];
  private animationFrame: number | null = null;
  isSpanish = true;
  private langSub: Subscription | null = null;
  
  showConsentModal = false;
  consentParental = false;
  aceptacionPrivacidad = false;
  aceptacionTratamiento = false;
  
  isSubmittingAuth = false;

  constructor(
    private storyState: StoryStateService,
    private languageService: LanguageService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.animate();
    this.langSub = this.languageService.isSpanish$.subscribe(
      val => this.isSpanish = val
    );
    
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.langSub?.unsubscribe();
  }

  setLanguage(lang: 'es' | 'en') {
    this.languageService.setLanguage(lang);
  }
getText(es: string, en: string): string {
      return this.isSpanish ? es : en;
    }
  onMouseMove(event: MouseEvent) {
    const count = 2;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: event.clientX,
        y: event.clientY,
        opacity: 1,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 15 + 10
      });
    }
  }

  private animate() {
    this.stars.forEach(star => {
      star.x += star.vx;
      star.y += star.vy;
      star.opacity -= 0.02;
    });

    this.stars = this.stars.filter(s => s.opacity > 0);
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  isNavigating = false;

  startApp() {
    if (this.isNavigating || this.showConsentModal) return;
    
    const hasConsent = localStorage.getItem('parentalConsent') === 'true';
    if (!hasConsent) {
      this.showConsentModal = true;
      return;
    }

    this.proceedWithApp();
  }

  proceedWithApp() {
    this.isNavigating = true;
    const utterance = new SpeechSynthesisUtterance("¡Vamos allá!");
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    
    window.speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      this.storyState.setState(AppState.AGE_SELECT);
    };

    setTimeout(() => {
      this.storyState.setState(AppState.AGE_SELECT);
    }, 1500);
  }

  get canAcceptConsent(): boolean {
    return this.consentParental && this.aceptacionPrivacidad && this.aceptacionTratamiento;
  }

  acceptConsent(event: Event) {
    event.stopPropagation();
    if (!this.canAcceptConsent || this.isSubmittingAuth) return;

    this.isSubmittingAuth = true;
    this.apiService.registrarConsentimientoParental({
      consent_parental: this.consentParental,
      aceptacion_privacidad: this.aceptacionPrivacidad,
      aceptacion_tratamiento: this.aceptacionTratamiento
    }).subscribe({
      next: (res) => {
        localStorage.setItem('parentalConsent', 'true');
        this.showConsentModal = false;
        this.isSubmittingAuth = false;
        this.proceedWithApp();
      },
      error: (err) => {
        console.error('Error registering consent', err);
        this.isSubmittingAuth = false;
        alert(this.isSpanish ? 'Error al registrar el consentimiento. Por favor, inténtelo de nuevo.' : 'Error registering consent. Please try again.');
      }
    });
  }

  closeConsentModal(event: Event) {
    event.stopPropagation();
    this.showConsentModal = false;
  }

}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3;

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.size = Math.random() * 3 + 1;
    this.alpha = 1;

    const colors = ['#ffffff', '#fef08a', '#a78bfa'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    this.vx *= 0.98; // fricción suave
    this.vy *= 0.98;

    this.alpha -= 0.015;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}