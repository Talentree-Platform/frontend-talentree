import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BusinessOwner } from '../../../core/Interfaces/ibusiness-owner';
import { app } from '../../../../../../../server';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-approve-owner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './approve-owner.component.html',
  styleUrl: './approve-owner.component.css'
})
export class ApproveOwnerComponent {
  noteText!:string;
  @Input() businessOwner! :BusinessOwner | null;
  @Input() isOpen:boolean =true;
  @Output() notes = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @Output() approve =new EventEmitter<void>();


  onClose(){
    this.close.emit();
  }
  isApproved(): boolean {
    if (!this.businessOwner?.statusText) return false;
    return this.businessOwner.statusText.toLowerCase().includes('approved');
  }

  
  onApprove(){
    this.approve.emit();
    this.notes.emit(this.noteText);
  }

  limitWords(){
    this.notes.emit(this.noteText);
  }

}
