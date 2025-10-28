import {Component, Input, inject, computed} from '@angular/core';
import {NgClass, NgOptimizedImage} from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

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

  private themeService = inject(ThemeService);

  iconPath = computed(() => {
    const iconsWithDarkVariant = ['github'];

    if (iconsWithDarkVariant.includes(this.name) && this.themeService.isDark()) {
      return `assets/icons/${this.name}-white.svg`;
    }
    return `assets/icons/${this.name}.svg`;
  });
}
