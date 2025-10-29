import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lang-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lang-toggle.html',
  styleUrls: ['./lang-toggle.scss']
})
export class LangToggle {
  private t = inject(TranslateService);
  private elementRef = inject(ElementRef);
  current = signal<string>(this.t.getCurrentLang() || 'en');
  isOpen = signal<boolean>(false);

  languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'kh', label: 'ខ្មែរ', flag: '🇰🇭' },
    { code: 'vn', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'cn', label: '中文', flag: '🇨🇳' },
    { code: 'kr', label: '한국어', flag: '🇰🇷' }
  ];

  constructor() {
    this.t.onLangChange.subscribe(e => {
      this.current.set(e.lang);
      document.documentElement.lang = e.lang;
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleMenu() {
    this.isOpen.set(!this.isOpen());
  }

  selectLanguage(langCode: string) {
    this.t.use(langCode);
    localStorage.setItem('lang', langCode);
    this.isOpen.set(false);
  }

  getCurrentLanguage() {
    return this.languages.find(l => l.code === this.current());
  }
}
