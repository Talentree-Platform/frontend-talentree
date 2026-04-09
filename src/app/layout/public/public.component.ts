import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavbarComponent } from "../../modules/public/components/public-navbar/public-navbar.component";

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [ RouterOutlet, PublicNavbarComponent],
  templateUrl: './public.component.html',
  styleUrl: './public.component.css'
})
export class PublicComponent {

}
