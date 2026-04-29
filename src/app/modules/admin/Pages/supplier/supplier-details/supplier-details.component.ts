import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supplier } from '../../../core/Interfaces/isupplier';

@Component({
  selector: 'app-supplier-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-details.component.html',
  styleUrl: './supplier-details.component.css'
})
export class SupplierDetailsComponent {
  @Input() supplier: Supplier | null = null;
  @Output() close = new EventEmitter<void>();

  onClose(): void { this.close.emit(); }
  onOverlayClick(): void { this.onClose(); }

  getStatusColor(): string {
    return this.supplier?.isActive ? '#10b981' : '#ef4444';
  }
}