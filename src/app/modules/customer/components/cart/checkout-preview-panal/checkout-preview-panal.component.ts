// ─────────────────────────────────────────────────────────────────────────────
// Talentree · Checkout Preview Panel Component
// Slide-over overlay with address form + preview
// ─────────────────────────────────────────────────────────────────────────────
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckoutPreview, ShippingAddress } from '../../../Core/services/cart-service.service';

@Component({
  selector: 'app-checkout-preview-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-preview-panal.component.html',
  styleUrls: ['./checkout-preview-panal.component.scss'],
})
export class CheckoutPreviewPanelComponent implements OnInit {
  @Input() preview: CheckoutPreview | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() loadPreview = new EventEmitter<ShippingAddress>();

  address = signal<ShippingAddress>({
    fullName: '',
    phoneNumber: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Egypt',
  });

  formSubmitted = signal(false);

  ngOnInit(): void {
    // Trigger a preview load if address is pre-filled
  }

  updateField(field: keyof ShippingAddress, value: string): void {
    this.address.update(a => ({ ...a, [field]: value }));
  }

  get isFormValid(): boolean {
    const a = this.address();
    return !!(a.fullName && a.phoneNumber && a.street && a.city && a.postalCode && a.country);
  }

  onPreview(): void {
    this.formSubmitted.set(true);
    if (!this.isFormValid) return;
    this.loadPreview.emit(this.address());
  }

  onBackdropClick(e: Event): void {
    if ((e.target as HTMLElement).classList.contains('checkout-overlay')) {
      this.close.emit();
    }
  }
}