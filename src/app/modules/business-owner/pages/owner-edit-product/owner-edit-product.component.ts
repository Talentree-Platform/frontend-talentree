import { Component } from '@angular/core';

@Component({
  selector: 'app-owner-edit-product',
  standalone: true,
  imports: [],
  templateUrl: './owner-edit-product.component.html',
  styleUrl: './owner-edit-product.component.css'
})
export class OwnerEditProductComponent {
 /* ── Live Summary ── */

  productName: string = '';
  category: string = '';
  price: number | null = null;
  quantity: string = '';
  brand: string = '';

  freeShipping: boolean = false;
  trackInventory: boolean = false;
  featured: boolean = false;

  get formattedPrice(): string {
    return this.price !== null ? `$${this.price.toFixed(2)}` : '—';
  }

  /* ── Validation ── */

  errors: any = {};

  validate(): boolean {
    this.errors = {};

    if (!this.productName.trim()) {
      this.errors.productName = 'Product name is required.';
    }

    if (!this.category) {
      this.errors.category = 'Please select a category.';
    }

    if (this.price === null || this.price < 0) {
      this.errors.price = 'Enter a valid price.';
    }

    return Object.keys(this.errors).length === 0;
  }

  /* ── Actions ── */

  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;

  handleSave() {
    if (!this.validate()) {
      this.showErrorToastMessage();
      return;
    }

    this.showSuccessToastMessage();
  }

  handleCancel() {
    if (confirm('Discard all changes?')) {
      location.reload();
    }
  }

  showSuccessToastMessage() {
    this.showSuccessToast = true;
    setTimeout(() => this.showSuccessToast = false, 3000);
  }

  showErrorToastMessage() {
    this.showErrorToast = true;
    setTimeout(() => this.showErrorToast = false, 3000);
  }

}
