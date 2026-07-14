import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { PublicNavbarComponent } from "../../modules/public/components/public-navbar/public-navbar.component";
import { CommonModule } from '@angular/common';
import { PublicFooterComponent } from '../../modules/public/components/public-footer/public-footer.component';
import { RoleSelectModalComponent } from '../../modules/public/components/role-select-modal/role-select-modal.component';
import { HelpCenterWidgetComponent } from '../../shared/widgets/help-center-widget/help-center-widget.component';
@Component({
  selector: 'app-public',
  standalone: true,
  imports: [RouterOutlet, PublicNavbarComponent, CommonModule, RouterModule, PublicFooterComponent, RoleSelectModalComponent, HelpCenterWidgetComponent],
  templateUrl: './public.component.html',
  styleUrl: './public.component.css'
})
export class PublicComponent {

}
