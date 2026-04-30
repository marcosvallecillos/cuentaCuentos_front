import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoryStateService, AppState } from '../../services/story-state.service';

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

  constructor(private storyState: StoryStateService) {}

  ngOnInit() {
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
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
    if (this.isNavigating) return;
    this.isNavigating = true;
    setTimeout(() => {
      this.storyState.setState(AppState.AGE_SELECT);
    }, 1500);
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