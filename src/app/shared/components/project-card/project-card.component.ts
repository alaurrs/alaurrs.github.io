import {Component, Input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {LucideAngularModule} from 'lucide-angular';
import {SharedModule} from '../../shared-module';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'app-project-card',
  standalone: true,
  templateUrl: './project-card.component.html',
  imports: [
    NgOptimizedImage,
    LucideAngularModule,
    SharedModule,
    IconComponent
  ]
})
export class ProjectCardComponent {
  @Input() project!: {
    title: string;
    description: string;
    tags: string[];
    image: string;
    demo: string;
    source: string;
  }
}
