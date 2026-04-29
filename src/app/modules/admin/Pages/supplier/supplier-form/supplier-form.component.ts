import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../Services/supplier.service';
import { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../../../core/Interfaces/isupplier';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.css'
})
export class SupplierFormComponent implements OnInit, OnDestroy {

  @Input() supplier: Supplier | null = null;
  @Input() isEditMode = false;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  constructor(
    private _SupplierService: SupplierService,
    private _ToastrService: ToastrService
  ) {}

  saveSub!: Subscription;
  loading = false;
  error: string | null = null;

  form: CreateSupplierDto & { isActive?: boolean } = {
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    contactPerson: '',
    taxId: '',
    isActive: true,
  };

  ngOnInit(): void {
    if (this.isEditMode && this.supplier) {
      this.form = {
        name: this.supplier.name,
        description: this.supplier.description,
        email: this.supplier.email,
        phone: this.supplier.phone,
        address: this.supplier.address,
        city: this.supplier.city,
        country: this.supplier.country,
        contactPerson: this.supplier.contactPerson,
        taxId: this.supplier.taxId ?? '',
        isActive: this.supplier.isActive,
      };
    }
  }

  submit(): void {
    this.error = null;
    this.loading = true;

    if (this.isEditMode && this.supplier) {
      const dto: UpdateSupplierDto = { ...this.form, isActive: this.form.isActive ?? true };
      this.saveSub = this._SupplierService.updateSupplier(this.supplier.id, dto).subscribe({
        next: () => { this.loading = false; this.saved.emit(); },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message ?? 'Failed to update supplier.';
        }
      });
    } else {
      const dto: CreateSupplierDto = { ...this.form };
      this.saveSub = this._SupplierService.createSupplier(dto).subscribe({
        next: () => { this.loading = false; this.saved.emit(); },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message ?? 'Failed to create supplier.';
        }
      });
    }
  }

  onClose(): void { this.close.emit(); }

  ngOnDestroy(): void {
    if (this.saveSub) this.saveSub.unsubscribe();
  }
}