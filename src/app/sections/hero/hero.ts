import { Component } from '@angular/core';
import {LucideAngularModule} from "lucide-angular";
import {SharedModule} from "../../shared/shared-module";
import {ScrollTo} from '../../shared/directives/scroll-to';

@Component({
  selector: 'app-hero',
  imports: [
    LucideAngularModule,
    SharedModule,
    ScrollTo
  ],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {

}
