import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "../../modules/customer/components/co-navbar/co-navbar.component";
import { ToastComponent } from "../../modules/customer/components/Toast/toast/toast.component";
import { HelpCenterWidgetComponent } from '../../shared/widgets/help-center-widget/help-center-widget.component';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet, ToastComponent,HelpCenterWidgetComponent],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent {

}