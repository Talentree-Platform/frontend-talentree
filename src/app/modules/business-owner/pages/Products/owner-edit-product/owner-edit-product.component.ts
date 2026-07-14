import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { OwnerProductCategory, OwnerProductImageRef } from '../../../core/interfaces/owner-product';
import { BusinessOwnerProductsService } from '../../../core/services/business-owner-products.service';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 1000;

/** Maps ASP.NET ValidationProblemDetails field names (PUT body keys) to this form's error keys. */
const API_FIELD_TO_FORM_ERROR: Record<string, string> = {
  Name: 'productName',
  CategoryId: 'category',
  Description: 'description',
  Price: 'price',
  StockQuantity: 'quantity',
  Tags: 'tags',
  newImages: 'images'
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

  readonly maxDescriptionLength = MAX_DESCRIPTION_LENGTH;

  productId!: number;
  loading = true;
  loadError: string | null = null;

  categories: OwnerProductCategory[] = [];
  categoriesLoading = false;

  productName = '';
  description = '';
  categoryId: number | null = null;
  price: number | null = null;
  quantity: number | null = null;

  tags: string[] = [];
  tagInput = '';

  existingImages: OwnerProductImageRef[] = [];
  imagesToDelete: number[] = [];
  newImageSlots: { file: File; url: string }[] = [];

  isLoading = false;

  errors: Record<string, string> = {};

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productsApi: BusinessOwnerProductsService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();

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

  private loadCategories(): void {
    this.categoriesLoading = true;
    this.subs.add(
      this.productsApi.getCategories().subscribe({
        next: (list) => {
          this.categories = list;
          this.categoriesLoading = false;
        },
        error: () => {
          this.categoriesLoading = false;
          this.toastr.warning('Could not load categories. Please try again later.', 'Categories');
        }
      })
    );
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.loadError = null;
    this.subs.add(
      this.productsApi.getProductById(id).subscribe({
        next: (p) => {
          this.productName = p.name;
          this.description = p.description === '—' ? '' : p.description;
          this.categoryId = p.categoryId;
          this.price = p.price;
          this.quantity = p.stockQuantity;
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
    return this.price != null ? `$${this.price.toFixed(2)}` : '—';
  }

  get selectedCategoryName(): string {
    return this.categories.find((c) => c.id === this.categoryId)?.name ?? '—';
  }

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

    if (this.existingImages.length + this.newImageSlots.length < 1) {
      this.errors['images'] = 'At least one image is required (existing or new).';
    }

    return Object.keys(this.errors).length === 0;
  }

  /* ── Images ── */

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
      const url = URL.createObjectURL(file);
      this.newImageSlots.push({ file, url });
    });

    if (this.existingImages.length + this.newImageSlots.length > 0) delete this.errors['images'];
  }

  private isImageFile(file: File): boolean {
    if (file.type.startsWith('image/')) return true;
    return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(file.name);
  }

  removeExistingImage(img: OwnerProductImageRef): void {
    this.existingImages = this.existingImages.filter((x) => x.url !== img.url);
    if (img.id > 0 && !this.imagesToDelete.includes(img.id)) {
      this.imagesToDelete.push(img.id);
    }
  }

  removeNewImage(slot: { file: File; url: string }): void {
    URL.revokeObjectURL(slot.url);
    this.newImageSlots = this.newImageSlots.filter((s) => s !== slot);
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

  /* ── Save / cancel ── */

  handleSave(): void {
    if (!this.validate()) {
      this.toastr.error(Object.values(this.errors).join(' ') || 'Please fix the errors.', 'Validation');
      return;
    }

    this.isLoading = true;

    this.subs.add(
      this.productsApi
        .updateProduct(this.productId, {
          name: this.productName.trim(),
          categoryId: this.categoryId!,
          description: this.description.trim(),
          price: this.price!,
          stockQuantity: Math.floor(this.quantity!),
          tags: this.tags,
          imagesToDelete: this.imagesToDelete,
          newImages: this.newImageSlots.map((s) => s.file)
        })
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.toastr.success('Product updated successfully.', 'Success');
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
      this.toastr.error('Could not save changes. Please try again.', 'Error');
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
          : 'Could not save changes. Please try again.';
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
