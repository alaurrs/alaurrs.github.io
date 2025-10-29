import { Component } from '@angular/core';
import {ProjectCardComponent} from "../../shared/components/project-card/project-card.component";

@Component({
  selector: 'app-contact',
    imports: [
        ProjectCardComponent
    ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {

}
