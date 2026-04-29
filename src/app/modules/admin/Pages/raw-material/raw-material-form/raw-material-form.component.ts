import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RawMaterialService } from '../../../Services/raw-material.service';
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
  loading = false;
  error: string | null = null;

  categories = ['Fashion & Accessories', 'Handmade', 'Natural & Beauty Products'];

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
    }
  }

  submit(): void {
    this.error = null;
    this.loading = true;

    if (this.isEditMode && this.material) {
      const dto: UpdateRawMaterialDto = { ...this.form, isAvailable: this.form.isAvailable ?? true };
      this.saveSub = this._RawMaterialService.updateRawMaterial(this.material.id, dto).subscribe({
        next: () => { this.loading = false; this.saved.emit(); },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message ?? 'Failed to update material.';
        }
      });
    } else {
      this.saveSub = this._RawMaterialService.createRawMaterial(this.form).subscribe({
        next: () => { this.loading = false; this.saved.emit(); },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message ?? 'Failed to create material.';
        }
      });
    }
  }

  onClose(): void { this.close.emit(); }

  ngOnDestroy(): void {
    if (this.saveSub) this.saveSub.unsubscribe();
  }
}