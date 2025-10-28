import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appScrollTo]'
})
export class ScrollTo {
  @Input('appScrollTo') targetId!: string;

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    const target = document.getElementById(this.targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  constructor() { }

}
