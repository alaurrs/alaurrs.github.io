import {Component, HostListener, OnInit} from '@angular/core';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-custom-cursor',
  imports: [
    NgStyle
  ],
  templateUrl: './custom-cursor.html',
  styleUrl: './custom-cursor.scss',
})
export class CustomCursor implements OnInit{
  x = 0;
  y = 0;

  clicked = false;

  ngOnInit() {
    document.body.style.cursor = 'none';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.x = event.clientX;
    this.y = event.clientY;
  }


  @HostListener('document:mousedown')
  onMouseDown() {
    this.clicked = true;
    setTimeout(() => (this.clicked = false), 200);
  }
}
