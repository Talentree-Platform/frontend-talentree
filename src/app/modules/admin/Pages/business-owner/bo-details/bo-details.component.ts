import { BusinessOwner } from './../../../core/Interfaces/ibusiness-owner';
import { Component, EventEmitter, Input, Output } from '@angular/core';



@Component({
  selector: 'app-bo-details',
  standalone: true,
  imports: [],
  templateUrl: './bo-details.component.html',
  styleUrl: './bo-details.component.css'
})
export class BoDetailsComponent {
  @Input() businessOwner!: BusinessOwner | null;
  @Input() isOpen: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() approve = new EventEmitter<BusinessOwner|null>();
  @Output() reject = new EventEmitter<BusinessOwner|null>();
  @Output() sendMessage = new EventEmitter<void>();


  // Close modal
  onClose() {
    this.close.emit();
  }

  // Click outside modal
  onOverlayClick(event: MouseEvent) {
    this.onClose();
  }

  // Approve action
  onApprove(businessOwner:BusinessOwner|null) {
    this.approve.emit(businessOwner);
  }

  // Reject action
  onReject(businessOwner:BusinessOwner|null) {
    this.reject.emit(businessOwner);
  }

  // Send message
  onSendMessage() {
    this.sendMessage.emit();
  }


  // Check status
  isApproved(): boolean {
    if (!this.businessOwner?.statusText) return false;
    return this.businessOwner.statusText.toLowerCase().includes('approved');
  }

  isRejected(): boolean {
    if (!this.businessOwner?.statusText) return false;
    return this.businessOwner.statusText.toLowerCase().includes('rejected');
  }


  // Badge color based on status
  getStatusBadgeColor(): string {
    const status = this.businessOwner?.statusText?.toLowerCase();

    if (!status) return '#f59e0b'; // pending

    if (status.includes('approved')) return '#10b981'; // green
    if (status.includes('rejected')) return '#ef4444'; // red

    return '#f59e0b'; // pending
  }


  // Format date
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';

    const d = new Date(date);

    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  // Validate URL
  isValidUrl(url: string | undefined): boolean {
    if (!url) return false;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }


  // Open link
  openLink(url: string | undefined) {
    if (!this.isValidUrl(url)) return;

    window.open(url, '_blank');
  }


  // Format link text
  formatLink(url: string | undefined): string {
    if (!url) return '';

    return url.replace(/^https?:\/\//, '');
  }


}
