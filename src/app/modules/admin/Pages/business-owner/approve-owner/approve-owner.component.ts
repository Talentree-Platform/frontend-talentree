import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BusinessOwner } from '../../../core/Interfaces/ibusiness-owner';
import { FormsModule } from '@angular/forms';

export interface ApproveOwnerSubmitEvent {
  note: string;
}

@Component({
  selector: 'app-approve-owner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './approve-owner.component.html',
  styleUrl: './approve-owner.component.css'
})
export class ApproveOwnerComponent {
  noteText = '';
  @Input() businessOwner!: BusinessOwner | null;
  @Input() isOpen = true;
  @Input() isApproveRequestPending = false;
  @Output() close = new EventEmitter<void>();
  @Output() approve = new EventEmitter<ApproveOwnerSubmitEvent>();

  onClose(): void {
    this.close.emit();
  }

  isApproved(): boolean {
    if (!this.businessOwner?.statusText) return false;
    return this.businessOwner.statusText.toLowerCase().includes('approved');
  }

  onApprove(): void {
    if (this.isApproveRequestPending) return;
    this.approve.emit({ note: this.noteText?.trim() ?? '' });
  }
}
