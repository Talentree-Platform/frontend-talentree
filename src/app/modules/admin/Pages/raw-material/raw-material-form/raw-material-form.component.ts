import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RawMaterialService } from '../../../core/services/raw-material.service';
import { RawMaterial, CreateRawMaterialDto, UpdateRawMaterialDto } from '../../../core/Interfaces/iraw-material';

@Component({
  selector: 'app-raw-material-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './raw-material-form.component.html',
  styleUrl: './raw-material-form.component.css'
})
export class RawMaterialFormComponent implements OnInit, OnDestroy {

  @Input() material: RawMaterial | null = null;
  @Input() isEditMode = false;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  constructor(
    private _RawMaterialService: RawMaterialService,
    private _ToastrService: ToastrService
  ) {}

  saveSub!: Subscription;
  uploadSub!: Subscription;
  loading = false;
  error: string | null = null;

  categories = ['Fashion & Accessories', 'Handmade', 'Natural & Beauty Products'];

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form: CreateRawMaterialDto & { isAvailable?: boolean } = {
    name: '',
    description: '',
    price: 0,
    unit: '',
    minimumOrderQuantity: 1,
    stockQuantity: 0,
    category: '',
    supplierId: 0,
    pictureUrl: '',
    isAvailable: true,
  };

  ngOnInit(): void {
    if (this.isEditMode && this.material) {
      this.form = {
        name: this.material.name,
        description: this.material.description,
        price: this.material.price,
        unit: this.material.unit,
        minimumOrderQuantity: this.material.minimumOrderQuantity,
        stockQuantity: this.material.stockQuantity,
        category: this.material.category,
        supplierId: this.material.supplierId,
        pictureUrl: this.material.pictureUrl ?? '',
        isAvailable: this.material.isAvailable,
      };
      if (this.material.pictureUrl) {
        this.imagePreview = this.material.pictureUrl;
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate: Type Check
      if (!file.type.startsWith('image/')) {
        this._ToastrService.error('Please select a valid image file.', 'Invalid File');
        return;
      }

      // Validate: Size Check (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this._ToastrService.error('Image size must be less than 5MB.', 'File Too Large');
        return;
      }

      this.selectedFile = file;

      // FileReader for preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submit(): void {
    this.error = null;
    this.loading = true;

    if (this.isEditMode && this.material) {
      const dto: UpdateRawMaterialDto = { ...this.form, isAvailable: this.form.isAvailable ?? true };
      this.saveSub = this._RawMaterialService.updateRawMaterial(this.material.id, dto).subscribe({
        next: () => {
          if (this.selectedFile) {
            this.uploadImageAndFinish(this.material!.id, 'Raw material updated successfully!');
          } else {
            this.loading = false;
            this._ToastrService.success('Raw material updated successfully!');
            this.saved.emit();
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message ?? 'Failed to update material.';
          this._ToastrService.error(this.error || '');
        }
      });
    } else {
      this.saveSub = this._RawMaterialService.createRawMaterial(this.form).subscribe({
        next: (res) => {
          const newId = res?.data?.id;
          if (newId && this.selectedFile) {
            this.uploadImageAndFinish(newId, 'Raw material created successfully!');
          } else {
            this.loading = false;
            this._ToastrService.success('Raw material created successfully!');
            this.saved.emit();
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message ?? 'Failed to create material.';
          this._ToastrService.error(this.error || '');
        }
      });
    }
  }

  private uploadImageAndFinish(id: number, successMsg: string): void {
    if (!this.selectedFile) return;
    this.uploadSub = this._RawMaterialService.uploadImage(id, this.selectedFile).subscribe({
      next: () => {
        this.loading = false;
        this._ToastrService.success(successMsg);
        this.saved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Failed to upload material image.';
        this._ToastrService.error(this.error || '');
      }
    });
  }

  onClose(): void { this.close.emit(); }

  ngOnDestroy(): void {
    if (this.saveSub) this.saveSub.unsubscribe();
    if (this.uploadSub) this.uploadSub.unsubscribe();
  }
}