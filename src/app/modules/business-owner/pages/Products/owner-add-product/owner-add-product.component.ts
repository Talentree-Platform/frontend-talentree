import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { BusinessOwnerProductsService } from '../../../core/services/business-owner-products.service';

/** Map visible category labels to API CategoryId values (update to match your backend). */
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

@Component({
  selector: 'app-owner-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './owner-add-product.component.html',
  styleUrl: './owner-add-product.component.css'
})
export class OwnerAddProductComponent implements OnDestroy, AfterViewInit {
  private readonly subs = new Subscription();

  imageCount = 0;
  selectedFiles: File[] = [];

  constructor(
    private readonly productsApi: BusinessOwnerProductsService,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {}

  ngAfterViewInit(): void {
    this.refreshSummary();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /** Updates the right-column Summary and Product Status from current form values. */
  refreshSummary(): void {
    const nameEl = document.getElementById('productName') as HTMLInputElement | null;
    const name = nameEl?.value?.trim() ?? '';
    this.setSummaryText('s-name', name || '—');

    const catEl = document.getElementById('category') as HTMLSelectElement | null;
    const catEmpty = !catEl?.value || catEl.selectedIndex <= 0;
    const catLabel = catEl?.options[catEl.selectedIndex]?.text?.trim() ?? '';
    this.setSummaryText('s-category', catEmpty ? '—' : catLabel);

    const sellingEl = document.getElementById('sellingPrice') as HTMLInputElement | null;
    const rawPrice = sellingEl?.value?.trim() ?? '';
    let priceLabel = '—';
    if (rawPrice !== '') {
      const n = Number(rawPrice);
      if (Number.isFinite(n) && n > 0) {
        priceLabel = `$${n.toFixed(2)}`;
      }
    }
    this.setSummaryText('s-price', priceLabel);

    const qtyEl = document.getElementById('quantity') as HTMLInputElement | null;
    const q = qtyEl?.value?.trim() ?? '';
    this.setSummaryText('s-stock', q !== '' ? q : '—');

    const brandEl = document.getElementById('brand') as HTMLInputElement | null;
    const brand = brandEl?.value?.trim() ?? '';
    this.setSummaryText('s-brand', brand || '—');

    const imgBadge = document.getElementById('s-images');
    if (imgBadge) {
      const n = this.selectedFiles.length;
      imgBadge.textContent = n === 0 ? '0 uploaded' : `${n} uploaded`;
    }

    const ship = document.getElementById('freeShipping') as HTMLInputElement | null;
    this.setStatusPill('st-shipping', !!ship?.checked);

    const inv = document.getElementById('trackInventory') as HTMLInputElement | null;
    this.setStatusPill('st-inventory', inv?.checked !== false);

    const feat = document.getElementById('featured') as HTMLInputElement | null;
    this.setStatusPill('st-featured', !!feat?.checked);
  }

  private setSummaryText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  private setStatusPill(id: string, on: boolean): void {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = on ? 'ON' : 'OFF';
    el.className = `ap-status ${on ? 'ap-status--on' : 'ap-status--off'}`;
  }

  /* ── Image Upload ── */

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

    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
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

      this.selectedFiles.push(file);
      const url = URL.createObjectURL(file);
      this.addPreviewToGrid(url, file.name, file);
    });

    this.refreshImageCount();
  }

  /** Accept common image types; some browsers omit MIME or use non-image/* for HEIC etc. */
  private isImageFile(file: File): boolean {
    if (file.type.startsWith('image/')) return true;
    return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(file.name);
  }

  private addPreviewToGrid(url: string, fileName: string, file: File): void {
    const grid = document.getElementById('previewGrid');
    if (!grid) return;

    const div = document.createElement('div');
    div.className = 'ap-preview-item';
    div.innerHTML = `
        <img src="${url}" alt="${fileName}" />
        <button type="button" class="ap-preview-item__remove">
          ✕
        </button>
      `;

    div.querySelector('button')?.addEventListener('click', () => {
      this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
      URL.revokeObjectURL(url);
      div.remove();
      this.refreshImageCount();
    });

    grid.appendChild(div);
  }

  private refreshImageCount(): void {
    this.imageCount = this.selectedFiles.length;
    this.refreshSummary();
  }

  updateImageCount(delta: number) {
    this.imageCount += delta;
    if (this.imageCount < 0) this.imageCount = 0;
  }

  /* ── Tags ── */

  tags: string[] = [];
  tagInput = '';

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

  /* ── Char Count ── */

  description = '';

  get charCount(): number {
    return this.description.length;
  }

  /* ── Live Summary ── */

  productName = '';
  category = '';
  /** Resolved from the category select for the API */
  categoryId: number | null = null;
  price: number | null = null;
  quantity = '';
  brand = '';

  freeShipping = false;
  trackInventory = false;
  featured = false;

  get formattedPrice(): string {
    return this.price !== null ? `$${this.price.toFixed(2)}` : '—';
  }

  /* ── Validation ── */

  errors: Record<string, string> = {};

  /** Sync template fields (plain HTML inputs) into component state before validate/save. */
  private syncFromDom(): void {
    const nameEl = document.getElementById('productName') as HTMLInputElement | null;
    this.productName = nameEl?.value ?? '';

    const descEl = document.getElementById('description') as HTMLTextAreaElement | null;
    this.description = descEl?.value ?? '';

    const catEl = document.getElementById('category') as HTMLSelectElement | null;
    const optText = catEl?.options[catEl.selectedIndex]?.text?.trim() ?? '';
    this.category = optText;
    this.categoryId = CATEGORY_NAME_TO_ID[optText] ?? null;

    const selling = document.getElementById('sellingPrice') as HTMLInputElement | null;
    const raw = selling?.value?.trim();
    if (raw === undefined || raw === '') {
      this.price = null;
    } else {
      const n = Number(raw);
      this.price = Number.isFinite(n) ? n : null;
    }

    const qtyEl = document.getElementById('quantity') as HTMLInputElement | null;
    this.quantity = qtyEl?.value ?? '';
  }

  validate(): boolean {
    this.syncFromDom();
    this.errors = {};

    if (!this.productName.trim()) {
      this.errors['productName'] = 'Product name is required.';
    }

    if (!this.category || this.categoryId == null) {
      this.errors['category'] = 'Please select a category.';
    }

    if (this.price === null || this.price <= 0) {
      this.errors['price'] = 'Enter a price greater than zero.';
    }

    if (this.selectedFiles.length === 0) {
      this.errors['images'] = 'At least one image is required.';
    }

    return Object.keys(this.errors).length === 0;
  }

  /* ── Actions ── */

  isLoading = false;

  handleSave() {
    if (!this.validate()) {
      this.showValidationToast();
      return;
    }

    const formData = new FormData();

    formData.append('Name', this.productName.trim());
    formData.append('CategoryId', String(this.categoryId!));
    formData.append('Description', this.description.trim());
    formData.append('Price', this.price != null ? String(this.price) : '0');
    const stock = Math.max(0, Math.floor(Number.parseInt(this.quantity, 10) || 0));
    formData.append('StockQuantity', String(stock));
    formData.append('Tags', this.tags.join('#'));

    this.selectedFiles.forEach((file) => {
      formData.append('images', file, file.name);
    });

    this.isLoading = true;
    this.setSaveButtonsDisabled(true);

    this.subs.add(
      this.productsApi.createProduct(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.setSaveButtonsDisabled(false);
          this.toastr.success('Product saved successfully.', 'Success');
          void this.router.navigate(['/businessowner/ownerProduct']);
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.setSaveButtonsDisabled(false);
          this.showApiErrorToast(err);
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

  private showValidationToast(): void {
    const parts = Object.values(this.errors).filter(Boolean);
    this.toastr.error(parts.join(' ') || 'Please fix the errors below.', 'Validation');
  }

  private showApiErrorToast(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      let msg = 'Could not save the product. Please try again.';
      if (typeof body === 'object' && body && 'message' in body) {
        msg = String((body as { message: string }).message);
      } else if (typeof body === 'string' && body.trim()) {
        msg = body;
      }
      this.toastr.error(msg, 'Error');
    } else {
      this.toastr.error('Could not save the product. Please try again.', 'Error');
    }
  }

  handleCancel() {
    if (confirm('Discard all changes?')) {
      location.reload();
    }
  }

  showSuccessToastMessage() {
    this.toastr.success('Product saved successfully.', 'Success');
  }

  showErrorToastMessage() {
    this.toastr.error('Please fix the errors below.', 'Validation');
  }
}
