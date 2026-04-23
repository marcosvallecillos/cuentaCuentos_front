import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-canvas',
  standalone: false,
  templateUrl: './canvas.html',
  styleUrls: ['./canvas.scss']
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('drawingCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() drawingComplete = new EventEmitter<string>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  currentColor = '#FF6B6B';
  
  colors = [
    '#FF6B6B', '#FFA500', '#FFD700', '#90EE90', 
    '#87CEEB', '#9370DB', '#FF69B4', '#40E0D0'
  ];

  objectLabel = '';

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    canvas.width = 600;
    canvas.height = 500;
    
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 5;
  }

  selectColor(color: string) {
    this.currentColor = color;
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;
    
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clear() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  undo() {
    // Implementación simplificada: clear
    this.clear();
  }

  submitDrawing() {
    if (!this.objectLabel.trim()) {
      alert('¡Dime qué has dibujado!');
      return;
    }
    
    this.drawingComplete.emit(this.objectLabel.trim());
    this.objectLabel = '';
  }
}