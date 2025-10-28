import { Component } from '@angular/core';
import {SharedModule} from '../../shared/shared-module';
import {LucideAngularModule} from 'lucide-angular';
import {IconComponent} from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-projects',
  imports: [
    SharedModule,
    LucideAngularModule,
    IconComponent
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {

}
