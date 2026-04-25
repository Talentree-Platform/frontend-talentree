import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component,  output,  Output } from '@angular/core';
import { EventEmitter } from 'node:stream';
import { MaterialCartService } from '../../core/services/material-cart.service';


@Component({
  selector: 'app-owner-top-nav',
  standalone: true,
  imports: [RouterLink , RouterLinkActive],
  templateUrl: './owner-top-nav.component.html',
  styleUrl: './owner-top-nav.component.css'
})

export class OwnerTopNavComponent {
  constructor(private _MaterialCartService: MaterialCartService) {}

cartCount = 0;

ngOnInit() {
  this._MaterialCartService.loadCartCount();
  this._MaterialCartService.count$.subscribe(count => {
    this.cartCount = count;
  });
}
  
  
}
