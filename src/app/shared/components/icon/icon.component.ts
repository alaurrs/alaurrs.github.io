import { Component, Input } from '@angular/core';
import {NgClass, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html'
  ,
  imports: [
    NgClass,
    NgOptimizedImage
  ],
  standalone: true
})
export class IconComponent {
  @Input() name!: string;
  @Input() classes = 'w-5 h-5';
  @Input() size = 24;
}
