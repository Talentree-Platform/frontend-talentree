import { Component, inject, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminProductService } from '../../core/services/admin-products.service';


@Component({
  selector: 'app-admin-product-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-product-home.component.html',
  styleUrl: './admin-product-home.component.css'
})
export class AdminProductHomeComponent implements OnInit {
  private readonly _ProductsService = inject(AdminProductService);


  ngOnInit(): void {
    this._ProductsService.getProducts().subscribe({
      next: (res) => { console.log(res) },
      error: (err) => { console.log(err) }
    });
  }
}
