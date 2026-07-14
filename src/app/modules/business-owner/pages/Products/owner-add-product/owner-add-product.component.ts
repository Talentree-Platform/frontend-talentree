import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { BusinessOwnerProductsService } from '../../../core/services/business-owner-products.service';
import { OwnerProductCategory } from '../../../core/interfaces/owner-product';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Static category options — there is no BusinessOwnerProducts categories API.
 * NOTE: ids are placeholders (1, 2, 3...) pending confirmation against the
 * real backend CategoryId values; update here if they don't match.
 */
const PRODUCT_CATEGORIES: OwnerProductCategory[] = [
  { id: 1, name: 'Handmade Crafts' },
  { id: 2, name: 'Fashion & Accessories' },
  { id: 3, name: 'Natural & Beauty Products' }
];

/** Maps ASP.NET ValidationProblemDetails field names (POST body keys) to this form's error keys. */
const API_FIELD_TO_FORM_ERROR: Record<string, string> = {
  Name: 'productName',
  CategoryId: 'category',
  Description: 'description',
  Price: 'price',
  StockQuantity: 'quantity',
  Tags: 'tags',
  images: 'images'
};

interface ImagePreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-owner-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './owner-add-product.component.html',
  styleUrl: './owner-add-product.component.css'
})
export class OwnerAddProductComponent implements OnDestroy {
  private readonly subs = new Subscription();

  readonly maxDescriptionLength = MAX_DESCRIPTION_LENGTH;
  readonly categories: OwnerProductCategory[] = PRODUCT_CATEGORIES;

  productName = '';
  description = '';
  categoryId: number | null = null;
  price: number | null = null;
  quantity: number | null = null;

  tags: string[] = [];
  tagInput = '';

  selectedFiles: File[] = [];
  previews: ImagePreview[] = [];

  errors: Record<string, string> = {};
  isLoading = false;

  constructor(
    private readonly productsApi: BusinessOwnerProductsService,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.previews.forEach((p) => URL.revokeObjectURL(p.url));
  }

  get charCount(): number {
    return this.description.length;
  }

  get formattedPrice(): string {
    return this.price != null ? `$${this.price.toFixed(2)}` : '—';
  }

  get selectedCategoryName(): string {
    return this.categories.find((c) => c.id === this.categoryId)?.name ?? '—';
  }

  /* ── Image upload ── */

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
  }

  handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.addFiles(input.files);
      input.value = '';
    }
  }

  addFiles(files: FileList | null): void {
    if (!files?.length) return;

    Array.from(files).forEach((file) => {
      if (!this.isImageFile(file)) {
        this.toastr.warning(`"${file.name}" is not a supported image type.`, 'Images');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        this.toastr.warning(`"${file.name}" exceeds the 10 MB limit.`, 'Images');
        return;
      }
      this.selectedFiles.push(file);
      this.previews.push({ file, url: URL.createObjectURL(file) });
    });

    if (this.selectedFiles.length) delete this.errors['images'];
  }

  removeImage(entry: ImagePreview): void {
    this.selectedFiles = this.selectedFiles.filter((f) => f !== entry.file);
    this.previews = this.previews.filter((p) => p !== entry);
    URL.revokeObjectURL(entry.url);
  }

  private isImageFile(file: File): boolean {
    if (file.type.startsWith('image/')) return true;
    return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(file.name);
  }

  /* ── Tags ── */

  handleTagKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  addTag(): void {
    const val = this.tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    this.tagInput = '';
    if (!val || this.tags.includes(val)) return;
    this.tags.push(val);
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  /* ── Validation ── */

  validate(): boolean {
    this.errors = {};

    if (!this.productName.trim()) {
      this.errors['productName'] = 'Product name is required.';
    }

    if (!this.description.trim()) {
      this.errors['description'] = 'Description is required.';
    }

    if (this.categoryId == null) {
      this.errors['category'] = 'Please select a valid category.';
    }

    if (this.price == null || this.price <= 0) {
      this.errors['price'] = 'Price must be greater than 0.';
    }

    if (this.quantity == null || this.quantity < 0) {
      this.errors['quantity'] = 'Stock quantity is required.';
    }

    if (this.selectedFiles.length === 0) {
      this.errors['images'] = 'At least one image is required.';
    }

    return Object.keys(this.errors).length === 0;
  }

  /* ── Save / cancel ── */

  handleSave(): void {
    if (!this.validate()) {
      this.toastr.error(Object.values(this.errors).join(' '), 'Validation');
      return;
    }

    this.isLoading = true;

    this.subs.add(
      this.productsApi
        .createProduct({
          name: this.productName.trim(),
          categoryId: this.categoryId!,
          description: this.description.trim(),
          price: this.price!,
          stockQuantity: Math.floor(this.quantity!),
          tags: this.tags,
          images: this.selectedFiles
        })
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.toastr.success('Product saved successfully.', 'Success');
            void this.router.navigate(['/businessowner/ownerProduct']);
          },
          error: (err: unknown) => {
            this.isLoading = false;
            this.handleApiError(err);
          }
        })
    );
  }

  handleCancel(): void {
    if (confirm('Discard all changes?')) {
      void this.router.navigate(['/businessowner/ownerProduct']);
    }
  }

  private handleApiError(err: unknown): void {
    if (!(err instanceof HttpErrorResponse)) {
      this.toastr.error('Could not save the product. Please try again.', 'Error');
      return;
    }

    const fieldErrors = this.extractFieldErrors(err.error);
    if (fieldErrors) {
      this.errors = { ...this.errors, ...fieldErrors };
      this.toastr.error(Object.values(fieldErrors).join(' '), 'Validation');
      return;
    }

    const body = err.error;
    const msg =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: string }).message)
        : typeof body === 'string' && body.trim()
          ? body
          : 'Could not save the product. Please try again.';
    this.toastr.error(msg, 'Error');
  }

  /** Maps ASP.NET ValidationProblemDetails `errors: { Field: string[] }` onto this form's error keys. */
  private extractFieldErrors(body: unknown): Record<string, string> | null {
    if (typeof body !== 'object' || body === null) return null;
    const raw = (body as { errors?: Record<string, string[] | string> }).errors;
    if (!raw || typeof raw !== 'object') return null;

    const out: Record<string, string> = {};
    for (const [field, messages] of Object.entries(raw)) {
      const key = API_FIELD_TO_FORM_ERROR[field] ?? field;
      out[key] = Array.isArray(messages) ? messages.join(' ') : String(messages);
    }
    return Object.keys(out).length ? out : null;
  }
}
