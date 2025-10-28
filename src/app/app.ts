import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SharedModule} from './shared/shared-module';
import {LucideAngularModule} from 'lucide-angular';
import {Hero} from './sections/hero/hero';
import {Projects} from './sections/projects/projects';

@Component({
  selector: 'app-root',
  imports: [SharedModule, LucideAngularModule, Hero, Projects],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sallyvnge-portfolio');
}
