import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RawMaterial } from '../../../core/Interfaces/iraw-material';

@Component({
  selector: 'app-raw-material-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raw-material-details.component.html',
  styleUrl: './raw-material-details.component.css'
})
export class RawMaterialDetailsComponent {
  @Input() material: RawMaterial | null = null;
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();

  onClose(): void { this.close.emit(); }
  onOverlayClick(): void { this.onClose(); }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getStockBadgeColor(): string {
    if (!this.material) return '#888';
    if (this.material.stockQuantity === 0) return '#ef4444';
    if (this.material.stockQuantity < 10) return '#f59e0b';
    return '#10b981';
  }
}