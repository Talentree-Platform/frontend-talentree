import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-owner-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './owner-add-product.component.html',
  styleUrl: './owner-add-product.component.css'
})
export class OwnerAddProductComponent {
   imageCount: number = 0;

  @ViewChild('uploadZone') uploadZone!: ElementRef;
  @ViewChild('previewGrid') previewGrid!: ElementRef;

  /* ── Image Upload ── */

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.uploadZone.nativeElement.classList.add('ap-upload-zone--active');
  }

  onDragLeave(event: DragEvent) {
    this.uploadZone.nativeElement.classList.remove('ap-upload-zone--active');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.onDragLeave(event);

    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  handleFileSelect(event: any) {
    this.addFiles(event.target.files);
  }

  addFiles(files: FileList) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const url = URL.createObjectURL(file);

      const div = document.createElement('div');
      div.className = 'ap-preview-item';
      div.innerHTML = `
        <img src="${url}" alt="${file.name}" />
        <button type="button" class="ap-preview-item__remove">
          ✕
        </button>
      `;

      div.querySelector('button')?.addEventListener('click', () => {
        div.remove();
        this.updateImageCount(-1);
      });

      this.previewGrid.nativeElement.appendChild(div);

      this.imageCount++;
      this.updateImageCount(0);
    });
  }

  updateImageCount(delta: number) {
    this.imageCount += delta;
    if (this.imageCount < 0) this.imageCount = 0;
  }

  /* ── Tags ── */

  tags: string[] = [];
  tagInput: string = '';

  handleTagKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  addTag() {
    const val = this.tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!val) return;

    if (this.tags.includes(val)) {
      this.tagInput = '';
      return;
    }

    this.tags.push(val);
    this.tagInput = '';
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  /* ── Char Count ── */

  description: string = '';

  get charCount(): number {
    return this.description.length;
  }

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
