import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { PublicNavbarComponent } from "../../modules/public/components/public-navbar/public-navbar.component";
import { RoleSelectModalComponent } from '../../modules/public/components/role-select-modal/role-select-modal.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ RouterOutlet, PublicNavbarComponent, RoleSelectModalComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

}
