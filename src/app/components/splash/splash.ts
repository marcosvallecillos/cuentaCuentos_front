import { Component, HostListener } from '@angular/core';
import { StoryStateService, AppState } from '../../services/story-state.service';

@Component({
  selector: 'app-splash',
  standalone: false,
  templateUrl: './splash.html',
  styleUrl: './splash.scss',
})
export class SplashComponent {
  constructor(private storyState: StoryStateService) {}


  createStar(x: number, y: number) {
    const star = document.createElement('div');
    star.className = 'mouse-star';
    star.innerHTML = '✨';
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    
    const size = Math.random() * 20 + 10;
    star.style.fontSize = `${size}px`;
    
    document.body.appendChild(star);
    
    // Random movement direction
    const destinationX = x + (Math.random() - 0.5) * 100;
    const destinationY = y + (Math.random() - 0.5) * 100;
    
    star.animate([
      { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${destinationX - x}px, ${destinationY - y}px) scale(0) rotate(180deg)`, opacity: 0 }
    ], {
      duration: 1000,
      easing: 'ease-out'
    }).onfinish = () => star.remove();
  }

  startApp() {
    this.storyState.setState(AppState.AGE_SELECT);
  }
stars: { x: number; y: number; opacity: number; vx: number; vy: number }[] = [];

onMouseMove(event: MouseEvent) {
  const count = 4; // más “magia”

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;

    this.stars.push({
      x: event.clientX + (Math.random() - 0.5) * 20,
      y: event.clientY + (Math.random() - 0.5) * 20,
      opacity: 1,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    });
  }

  // SOLO reducir opacidad (NO mover aquí)
  this.stars.forEach(s => s.opacity -= 0.03);

  this.stars = this.stars.filter(s => s.opacity > 0);
}
}
