import {ThemeService} from '../../../core/services/theme.service';
import {Component} from '@angular/core';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  imports: [
    LucideAngularModule
  ]
})
export class ThemeToggleComponent {
  constructor(public themeService: ThemeService) {
  }

  toggleTheme() {
    this.themeService.toggle();
  }
}
