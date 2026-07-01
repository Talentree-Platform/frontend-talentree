import { MaterialCartService } from '../../../core/services/material-cart.service';
import { Material } from '../../../core/interfaces/material';
import { ActivatedRoute } from '@angular/router';
import { MaterialService } from '../../../core/services/material.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-raw-material-product-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './raw-material-product-details.component.html',
  styleUrl: './raw-material-product-details.component.css'
})
export class RawMaterialProductDetailsComponent implements OnInit, OnDestroy {

  constructor(
    private _MaterialService: MaterialService,
    private route: ActivatedRoute,
    private _MaterialCartService: MaterialCartService
  ) {}

  materialId: number = Number(this.route.snapshot.paramMap.get('id'));
  materialDetails!: Material;
  materialSub!: Subscription;
  cartSub!: Subscription;
  quentity: number = 0;

  // ── UI state ──────────────────────────────────────────────────────────
  cartLoading: boolean = false;
  successMsg: string = '';
  errorMsg: string = '';

  ngOnInit() {
    this.loadMaterialDetails();
  }

  loadMaterialDetails() {
    this.materialSub = this._MaterialService.getMaterialById(this.materialId).subscribe({
      next: (res) => {
        this.materialDetails = res.data;
        this.quentity = res.data.minimumOrderQuantity;
      },
      error: (err) => {
        console.error('Failed to load material:', err);
        this.errorMsg = 'Failed to load material details. Please try again.';
      }
    });
  }

  addMaterialToCart() {
    // Guard: validate quantity
    if (!this.quentity || this.quentity < this.materialDetails.minimumOrderQuantity) {
      this.errorMsg = `Minimum order quantity is ${this.materialDetails.minimumOrderQuantity} ${this.materialDetails.unit}.`;
      this.clearMessagesAfterDelay();
      return;
    }

    if (this.quentity > this.materialDetails.stockQuantity) {
      this.errorMsg = `Only ${this.materialDetails.stockQuantity} ${this.materialDetails.unit} available in stock.`;
      this.clearMessagesAfterDelay();
      return;
    }

    this.cartLoading = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.cartSub = this._MaterialCartService
      .addMaterialToCart(this.materialId, this.quentity)
      .subscribe({
        next: (res) => {
          this.cartLoading = false;
          // Update cart count badge in navbar
          const count = res.data?.items?.length ?? 0;
          this._MaterialCartService.setCount(count);
          this.successMsg = `${this.materialDetails.name} added to cart successfully!`;
          this.clearMessagesAfterDelay();
        },
        error: (err) => {
          this.cartLoading = false;
          console.error('Add to cart failed:', err);
          this.errorMsg =
            err?.error?.message ||
            err?.error?.errors?.[0] ||
            'Failed to add item to cart. Please try again.';
          this.clearMessagesAfterDelay();
        }
      });
  }

  private clearMessagesAfterDelay(ms: number = 4000) {
    setTimeout(() => {
      this.successMsg = '';
      this.errorMsg = '';
    }, ms);
  }

  ngOnDestroy() {
    this.materialSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }
}