import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { log } from 'node:console';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  template: `<RouterOutlet></RouterOutlet>`
})
export class AppComponent {
  title = 'talentree';
  
}
