import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Button} from './components/button/button';
import {ArrowRight, ChartNoAxesCombined, ExternalLink, Globe, LucideAngularModule, Moon, Sun} from 'lucide-angular';
import {TranslateModule} from '@ngx-translate/core';



@NgModule({
  declarations: [Button],
  imports: [
    CommonModule,
    LucideAngularModule.pick({ArrowRight, ExternalLink, Sun, Moon, ChartNoAxesCombined, Globe}),
    TranslateModule

  ],
  exports: [Button, TranslateModule]
})
export class SharedModule { }
