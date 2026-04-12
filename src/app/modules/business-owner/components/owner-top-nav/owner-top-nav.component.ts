import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component,  output,  Output } from '@angular/core';
import { EventEmitter } from 'node:stream';


@Component({
  selector: 'app-owner-top-nav',
  standalone: true,
  imports: [RouterLink , RouterLinkActive],
  templateUrl: './owner-top-nav.component.html',
  styleUrl: './owner-top-nav.component.css'
})

export class OwnerTopNavComponent {
  toggleSidebar =output<void>();
  isOpen:boolean=false;
  toggle(){
    this.toggleSidebar.emit();
    this.isOpen=!this.isOpen;
  }

  
  
}
