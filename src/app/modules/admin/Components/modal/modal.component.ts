import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() message = '';
  @Input() isConfirm = false;
  @Input() isPrompt = false;
  @Input() promptPlaceholder = 'Enter reason...';
  @Input() minLength = 0;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() danger = false;

  @Output() confirmed = new EventEmitter<string | void>();
  @Output() closed = new EventEmitter<void>();

  inputValue = '';
  touched = false;

  get isInvalid(): boolean {
    if (!this.isPrompt) return false;
    return this.inputValue.trim().length < this.minLength;
  }

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.inputValue = '';
    this.touched = false;
    this.closed.emit();
  }

  onSubmit(): void {
    this.touched = true;
    if (this.isInvalid) return;

    if (this.isPrompt) {
      this.confirmed.emit(this.inputValue.trim());
    } else {
      this.confirmed.emit();
    }
    this.isOpen = false;
    this.inputValue = '';
    this.touched = false;
  }
}
