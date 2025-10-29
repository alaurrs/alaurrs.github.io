import { Component, inject } from '@angular/core';
import {SharedModule} from '../../shared/shared-module';
import {LucideAngularModule} from 'lucide-angular';
import {IconComponent} from '../../shared/components/icon/icon.component';
import {NgOptimizedImage} from '@angular/common';
import {ProjectCardComponent} from '../../shared/components/project-card/project-card.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-projects',
  imports: [
    SharedModule,
    LucideAngularModule,
    ProjectCardComponent
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  private translate = inject(TranslateService);

  projects = [
    {
      key: 'ai_dashboard',
      title: 'projects.items.ai_dashboard.title',
      description: 'projects.items.ai_dashboard.description',
      tags: ['Angular', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'],
      image: 'assets/images/ai-prompt-dashboard.png',
      demo: 'https://ai.sallyvnge.fr',
      source: 'https://github.com/sallyvnge/ai-prompt-dashboard'
    },
    {
      key: 'mini_portfolio',
      title: 'projects.items.mini_portfolio.title',
      description: 'projects.items.mini_portfolio.description',
      tags: ['Angular', 'TypeScript', 'Tailwind CSS', 'Docker', 'AWS'],
      image: 'assets/images/qsb-mini-portfolio.png',
      demo: 'https://mini-portfolio.tech',
      source: 'https://github.com/qsb-mini-portfolio'
    }
  ]
}
