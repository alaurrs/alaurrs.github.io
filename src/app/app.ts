import { Component, signal } from '@angular/core';
import {SharedModule} from './shared/shared-module';
import {LucideAngularModule} from 'lucide-angular';
import {Hero} from './sections/hero/hero';
import {Projects} from './sections/projects/projects';
import {ThemeToggleComponent} from './shared/components/theme-toggle/theme-toggle.component';
import {WorkExperience} from './sections/work-experience/work-experience';
import {WheelSnapDirective} from './shared/directives/wheel-snap.directive';
import {Contact} from './sections/contact/contact';
import {CustomCursor} from './shared/custom-cursor/custom-cursor';
import {ParticleTrail} from './shared/particle-trail/particle-trail';
import {SmokeTrail} from './shared/smoke-trail/smoke-trail';

@Component({
  selector: 'app-root',
  imports: [SharedModule, LucideAngularModule, Hero, Projects, ThemeToggleComponent, WorkExperience, WheelSnapDirective, Contact, CustomCursor, ParticleTrail, SmokeTrail],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sallyvnge-portfolio');
}
