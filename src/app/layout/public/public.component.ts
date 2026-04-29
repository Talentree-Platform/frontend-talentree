import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { PublicNavbarComponent } from "../../modules/public/components/public-navbar/public-navbar.component";
import { CommonModule } from '@angular/common';
import { PublicFooterComponent } from '../../modules/public/components/public-footer/public-footer.component';
@Component({
  selector: 'app-public',
  standalone: true,
  imports: [RouterOutlet, PublicNavbarComponent,CommonModule, RouterModule, PublicFooterComponent],
  templateUrl: './public.component.html',
  styleUrl: './public.component.css'
})
export class PublicComponent {

}
