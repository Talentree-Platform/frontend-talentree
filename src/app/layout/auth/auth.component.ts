import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { PublicNavbarComponent } from "../../modules/public/components/public-navbar/public-navbar.component";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ RouterOutlet, PublicNavbarComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

}
