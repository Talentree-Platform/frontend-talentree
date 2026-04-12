import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { OwnerProductImageRef } from '../../../core/interfaces/owner-product';
import { BusinessOwnerProductsService } from '../../../core/services/business-owner-products.service';

/** Same labels as add-product template options → API CategoryId */
const CATEGORY_NAME_TO_ID: Record<string, number> = {
  Electronics: 1,
  'Clothing & Apparel': 2,
  'Home & Garden': 3,
  'Sports & Outdoors': 4,
  'Beauty & Health': 5,
  'Books & Media': 6,
  'Toys & Games': 7,
  'Food & Beverages': 8,
  Automotive: 9,
  Other: 10
};

/** When API categoryName does not match dropdown labels */
const CATEGORY_ID_TO_LABEL: Record<number, string> = {
  1: 'Electronics',
  2: 'Clothing & Apparel',
  3: 'Home & Garden',
  4: 'Sports & Outdoors',
  5: 'Beauty & Health',
  6: 'Books & Media',
  7: 'Toys & Games',
  8: 'Food & Beverages',
  9: 'Automotive',
  10: 'Other'
};

@Component({
  selector: 'app-owner-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-edit-product.component.html',
  styleUrl: './owner-edit-product.component.css'
})
export class OwnerEditProductComponent implements OnInit, OnDestroy {
  private readonly subs = new Subscription();

  productId!: number;
  loading = true;
  loadError: string | null = null;

  productName = '';
  description = '';
  /** Select option label (visible text) */
  categoryLabel = '';
  price: number | null = null;
  quantity = '';

  tags: string[] = [];
  tagInput = '';

  existingImages: OwnerProductImageRef[] = [];
  imagesToDelete: number[] = [];
  newImageSlots: { file: File; url: string }[] = [];

  brand = '';
  freeShipping = false;
  trackInventory = false;
  featured = false;

  isLoading = false;

  errors: Record<string, string> = {};

  showSuccessToast = false;
  showErrorToast = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productsApi: BusinessOwnerProductsService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const raw =
      this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('id');
    const id = Number(raw);
    if (!raw || Number.isNaN(id) || id <= 0) {
      this.loading = false;
      this.loadError = 'Invalid product.';
      return;
    }
    this.productId = id;
    this.loadProduct(id);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.newImageSlots.forEach((s) => URL.revokeObjectURL(s.url));
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.loadError = null;
    this.subs.add(
      this.productsApi.getProductById(id).subscribe({
        next: (p) => {
          this.productName = p.name;
          this.description = p.description === '—' ? '' : p.description;
          let label = (p.categoryName || '').trim();
          if (!CATEGORY_NAME_TO_ID[label] && p.categoryId != null) {
            const mapped = CATEGORY_ID_TO_LABEL[p.categoryId];
            if (mapped) label = mapped;
          }
          this.categoryLabel = label;
          this.price = p.price;
          this.quantity = String(p.stockQuantity ?? '');
          this.tags = p.tagList.map((t) =>
            t.replace(/^#/, '').trim().toLowerCase().replace(/\s+/g, '-')
          );
          this.existingImages = [...(p.productImages?.length ? p.productImages : [])];
          this.imagesToDelete = [];
          this.loading = false;
        },
        error: (err: unknown) => {
          this.loading = false;
          this.loadError =
            err instanceof HttpErrorResponse
              ? (typeof err.error === 'object' && err.error && 'message' in err.error
                  ? String((err.error as { message: string }).message)
                  : err.message)
              : 'Could not load product.';
        }
      })
    );
  }

  get charCount(): number {
    return this.description.length;
  }

  get formattedPrice(): string {
    return this.price !== null ? `$${this.price.toFixed(2)}` : '—';
  }

  get categoryIdForApi(): number | null {
    const fromLabel = CATEGORY_NAME_TO_ID[this.categoryLabel];
    return fromLabel !== undefined ? fromLabel : null;
  }

  validate(): boolean {
    this.errors = {};

    if (!this.productName.trim()) {
      this.errors['productName'] = 'Product name is required.';
    }

    if (!this.categoryLabel || this.categoryIdForApi == null) {
      this.errors['category'] = 'Please select a category.';
    }

    if (this.price === null || this.price <= 0) {
      this.errors['price'] = 'Enter a price greater than zero.';
    }

    if (this.existingImages.length + this.newImageSlots.length < 1) {
      this.errors['images'] = 'At least one image is required (existing or new).';
    }

    return Object.keys(this.errors).length === 0;
  }

  /* ── Images ── */

  onDragOver(event: DragEvent) {
    event.preventDefault();
    document.getElementById('uploadZone')?.classList.add('ap-upload-zone--active');
  }

  onDragLeave(event: DragEvent) {
    document.getElementById('uploadZone')?.classList.remove('ap-upload-zone--active');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.onDragLeave(event);
    if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.addFiles(input.files);
      input.value = '';
    }
  }

  addFiles(files: FileList | null) {
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      if (!this.isImageFile(file)) return;
      const url = URL.createObjectURL(file);
      this.newImageSlots.push({ file, url });
    });
  }

  private isImageFile(file: File): boolean {
    if (file.type.startsWith('image/')) return true;
    return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(file.name);
  }

  removeExistingImage(img: OwnerProductImageRef) {
    this.existingImages = this.existingImages.filter((x) => x.url !== img.url);
    if (img.id > 0 && !this.imagesToDelete.includes(img.id)) {
      this.imagesToDelete.push(img.id);
    }
  }

  removeNewImage(slot: { file: File; url: string }) {
    URL.revokeObjectURL(slot.url);
    this.newImageSlots = this.newImageSlots.filter((s) => s !== slot);
  }

  /* ── Tags ── */

  handleTagKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  addTag() {
    const el = document.getElementById('tagInput') as HTMLInputElement | null;
    if (el) this.tagInput = el.value;

    const val = this.tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!val) return;

    if (this.tags.includes(val)) {
      this.tagInput = '';
      if (el) el.value = '';
      return;
    }

    this.tags.push(val);
    this.tagInput = '';
    if (el) el.value = '';
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  /* ── Save / cancel ── */

  handleSave() {
    if (!this.validate()) {
      const parts = Object.values(this.errors).filter(Boolean);
      this.toastr.error(parts.join(' ') || 'Please fix the errors.', 'Validation');
      return;
    }

    const cid = this.categoryIdForApi;
    if (cid == null) {
      this.toastr.error('Please select a valid category.', 'Validation');
      return;
    }

    const formData = new FormData();

    formData.append('Name', this.productName.trim());
    formData.append('CategoryId', String(cid));
    formData.append('Description', this.description.trim());
    formData.append('Price', this.price != null ? String(this.price) : '0');
    const stock = Math.max(0, Math.floor(Number.parseInt(this.quantity, 10) || 0));
    formData.append('StockQuantity', String(stock));
    formData.append('Tags', this.tags.join('#'));

    this.imagesToDelete.forEach((delId) => {
      formData.append('ImagesToDelete', String(delId));
    });

    this.newImageSlots.forEach((s) => {
      formData.append('newImages', s.file, s.file.name);
    });

    this.isLoading = true;
    this.setSaveButtonsDisabled(true);

    this.subs.add(
      this.productsApi.updateProduct(this.productId, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.setSaveButtonsDisabled(false);
          this.toastr.success('Product updated successfully.', 'Success');
          void this.router.navigate(['/businessowner/ownerProduct']);
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.setSaveButtonsDisabled(false);
          this.showApiError(err);
        }
      })
    );
  }

  private setSaveButtonsDisabled(disabled: boolean): void {
    const root = document.querySelector('.ap-page');
    if (!root) return;
    root.querySelectorAll<HTMLButtonElement>('button.btn-main.btn-gold').forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  private showApiError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      let msg = 'Could not save changes. Please try again.';
      if (typeof body === 'object' && body && 'message' in body) {
        msg = String((body as { message: string }).message);
      } else if (typeof body === 'string' && body.trim()) {
        msg = body;
      }
      this.toastr.error(msg, 'Error');
    } else {
      this.toastr.error('Could not save changes. Please try again.', 'Error');
    }
  }

  handleCancel() {
    if (confirm('Discard all changes?')) {
      void this.router.navigate(['/businessowner/ownerProduct']);
    }
  }

  showSuccessToastMessage() {
    this.toastr.success('Product updated successfully.', 'Success');
  }

  showErrorToastMessage() {
    this.toastr.error('Please fix the errors below.', 'Validation');
  }
}
