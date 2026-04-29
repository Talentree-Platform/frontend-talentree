import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-container',
  standalone: true,
  imports: [RouterOutlet],
  template: `<div class="auth-wrapper"><router-outlet></router-outlet></div>`
})
export class AuthContainerComponent {}

