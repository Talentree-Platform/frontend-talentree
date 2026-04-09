import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TableComponent } from "../../../Components/table/table.component";
import { HeaderCardComponent } from "../../../Components/header-card/header-card.component";


@Component({
  selector: 'app-admin-product-home',
  standalone: true,
  imports: [CommonModule, TableComponent, HeaderCardComponent],
  templateUrl: './admin-product-home.component.html',
  styleUrl: './admin-product-home.component.css'
})
export class AdminProductHomeComponent {

}
