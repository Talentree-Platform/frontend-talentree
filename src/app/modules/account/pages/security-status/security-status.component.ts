import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityStatus } from '../../account.models';

@Component({
  selector: 'app-security-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security-status.component.html',
  styleUrls: ['./security-status.component.css'],
})
export class SecurityStatusComponent {
  @Input() securityStatus!: SecurityStatus;

  get isLockedOut(): boolean {
    if (!this.securityStatus.lockoutEnd) return false;
    return new Date(this.securityStatus.lockoutEnd) > new Date();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  }
}