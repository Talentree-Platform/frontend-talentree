import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BusinessOwner } from '../../../core/Interfaces/ibusiness-owner';
import { FormsModule } from '@angular/forms';

/** Minimum trimmed length for a valid rejection reason */
const MIN_REJECTION_REASON_LENGTH = 10;

@Component({
  selector: 'app-reject-owner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reject-owner.component.html',
  styleUrls: ['../approve-owner/approve-owner.component.css', './reject-owner.component.css']
})
export class RejectOwnerComponent implements OnChanges {
  rejectionReason = '';

  @Input() businessOwner: BusinessOwner | null = null;
  @Input() isOpen = false;
  @Input() isRejectRequestPending = false;

  @Output() close = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();
  @Output() reason = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.rejectionReason = '';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  isRejected(): boolean {
    if (!this.businessOwner?.statusText) return false;
    return this.businessOwner.statusText.toLowerCase().includes('rejected');
  }

  isReasonValid(): boolean {
    return this.rejectionReason.trim().length >= MIN_REJECTION_REASON_LENGTH;
  }

  /**
   * Emit `reason` before `reject` so parent handlers that store the reason run
   * before `onReject()` reads `this.rejectionReason`.
   */
  onReject(): void {
    if (!this.isReasonValid() || this.isRejectRequestPending) return;
    const trimmed = this.rejectionReason.trim();
    this.reason.emit(trimmed);
    this.reject.emit();
  }
}
