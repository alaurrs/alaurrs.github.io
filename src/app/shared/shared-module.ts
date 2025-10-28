import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Button} from './components/button/button';
import {ArrowRight, ExternalLink, LucideAngularModule} from 'lucide-angular';



@NgModule({
  declarations: [Button],
  imports: [
    CommonModule,
    LucideAngularModule.pick({ ArrowRight, ExternalLink })

  ],
  exports: [Button]
})
export class SharedModule { }
