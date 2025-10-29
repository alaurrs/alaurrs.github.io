import {Component, inject, signal} from '@angular/core';
import {SharedModule} from './shared/shared-module';
import {LucideAngularModule} from 'lucide-angular';
import {Hero} from './sections/hero/hero';
import {Projects} from './sections/projects/projects';
import {ThemeToggleComponent} from './shared/components/theme-toggle/theme-toggle.component';
import {WorkExperience} from './sections/work-experience/work-experience';
import {WheelSnapDirective} from './shared/directives/wheel-snap.directive';
import {Contact} from './sections/contact/contact';
import {CustomCursor} from './shared/custom-cursor/custom-cursor';
import {SmokeTrail} from './shared/smoke-trail/smoke-trail';
import {TranslateService} from '@ngx-translate/core';
import {LangToggle} from './shared/lang-toggle/lang-toggle';

@Component({
  selector: 'app-root',
  imports: [SharedModule, LucideAngularModule, Hero, Projects, ThemeToggleComponent, WorkExperience, WheelSnapDirective, Contact, CustomCursor, SmokeTrail, LangToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private translate = inject(TranslateService);
  constructor() {
    const navLang = navigator.language.toLowerCase();
    let lang = localStorage.getItem('lang');

    if (!lang) {
      if (navLang.startsWith('fr')) lang = 'fr';
      else if (navLang.startsWith('km') || navLang.startsWith('kh')) lang = 'kh';
      else if (navLang.startsWith('vi') || navLang.startsWith('vn')) lang = 'vn';
      else if (navLang.startsWith('zh') || navLang.startsWith('cn')) lang = 'cn';
      else if (navLang.startsWith('ko') || navLang.startsWith('kr')) lang = 'kr';
      else lang = 'en';
    }

    this.translate.addLangs(['en', 'fr', 'kh', 'vn', 'cn', 'kr']);
    this.translate.use(lang);
    document.documentElement.lang = lang;
  }
}
