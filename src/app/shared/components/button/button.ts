import {Component, HostBinding, Input} from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() variant: 'primary' | 'secondary' = 'primary';

  @Input() rounded = false;

  @HostBinding('class') @Input() class = '';
}
