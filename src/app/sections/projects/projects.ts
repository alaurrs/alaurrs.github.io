import { Component } from '@angular/core';
import {SharedModule} from '../../shared/shared-module';
import {LucideAngularModule} from 'lucide-angular';
import {IconComponent} from '../../shared/components/icon/icon.component';
import {NgOptimizedImage} from '@angular/common';
import {ProjectCardComponent} from '../../shared/components/project-card/project-card.component';

@Component({
  selector: 'app-projects',
  imports: [
    SharedModule,
    LucideAngularModule,
    IconComponent,
    NgOptimizedImage,
    ProjectCardComponent
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  projects = [
    {
      title: 'AI Prompt Dashboard',
      description: 'A full-stack SaaS built with Angular & Spring Boot for managing AI prompts.',
      tags: ['Angular', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'],
      image: 'assets/images/ai-prompt-dashboard.png',
      demo: 'https://github.com/sallyvnge/ai-prompt-dashboard',
      source: 'https://github.com/sallyvnge/ai-prompt-dashboard'
    },
    {
      title: 'Mini Portfolio QSB',
      description: 'Personal finance tracker with charts, API integrations, and clean DevOps pipelines.',
      tags: ['Angular', 'TypeScript', 'Tailwind CSS', 'Docker', 'AWS'],
      image: 'assets/images/qsb-mini-portfolio.png',
      demo: 'https://github.com/qsb-mini-portfolio',
      source: 'https://github.com/qsb-mini-portfolio'
    }
  ]
}
