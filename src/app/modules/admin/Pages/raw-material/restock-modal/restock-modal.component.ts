import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RawMaterialService } from '../../../Services/raw-material.service';
import { RawMaterial } from '../../../core/Interfaces/iraw-material';

@Component({
  selector: 'app-restock-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restock-modal.component.html',
  styleUrl: './restock-modal.component.css'
})
export class RestockModalComponent implements OnDestroy {

  @Input() material: RawMaterial | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() restocked = new EventEmitter<void>();

  constructor(
    private _RawMaterialService: RawMaterialService,
    private _ToastrService: ToastrService
  ) {}

  restockSub!: Subscription;
  loading = false;
  error: string | null = null;
  quantityToAdd = 1;

  submit(): void {
    if (!this.material || this.quantityToAdd < 1) return;
    this.loading = true;
    this.restockSub = this._RawMaterialService
      .restockMaterial(this.material.id, { quantityToAdd: this.quantityToAdd })
      .subscribe({
        next: () => { this.loading = false; this.restocked.emit(); },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message ?? 'Failed to restock.';
        }
      });
  }

  onClose(): void { this.close.emit(); }

  ngOnDestroy(): void {
    if (this.restockSub) this.restockSub.unsubscribe();
  }
}