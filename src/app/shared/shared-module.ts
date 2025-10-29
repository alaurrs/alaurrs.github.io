import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Button} from './components/button/button';
import {ArrowRight, ChartNoAxesCombined, ExternalLink, Globe, LucideAngularModule, Moon, Sun} from 'lucide-angular';



@NgModule({
  declarations: [Button],
  imports: [
    CommonModule,
    LucideAngularModule.pick({ArrowRight, ExternalLink, Sun, Moon, ChartNoAxesCombined, Globe})

  ],
  exports: [Button]
})
export class SharedModule { }
