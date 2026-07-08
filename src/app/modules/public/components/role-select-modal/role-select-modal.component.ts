import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleSelectService } from '../../services/role-select.service';

@Component({
  selector: 'app-role-select-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-select-modal.component.html',
  styleUrl: './role-select-modal.component.css',
})
export class RoleSelectModalComponent {
  constructor(readonly roleSelect: RoleSelectService) {}

  close(): void {
    this.roleSelect.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
