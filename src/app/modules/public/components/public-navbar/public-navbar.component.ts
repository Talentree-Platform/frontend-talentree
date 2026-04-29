import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from '../../../auth/auth-routing.module';


@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [AuthRoutingModule,CommonModule,RouterModule],
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.css'
})
export class PublicNavbarComponent {

}
