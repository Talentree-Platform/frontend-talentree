import { ToastrService } from 'ngx-toastr';
import { AdminManagementService, CreateAdminDto } from '../../../core/services/adminManagment.service';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-admin.component.html',
  styleUrl: './create-admin.component.css'
})
export class CreateAdminComponent implements OnDestroy {

  @Output() close = new EventEmitter<void>();
  @Output() adminCreated = new EventEmitter<void>();

  constructor(
    private _AdminManagementService: AdminManagementService,
    private _ToastrService: ToastrService
  ) { }

  createSub!: Subscription;
  loading = false;
  error: string | null = null;

  form = {
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    password: '',
    confirmPassword: '',
  };

  submit(): void {
    this.error = null;
    this.loading = true;

    this.createSub = this._AdminManagementService.createAdmin(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this._ToastrService.success('Admin created successfully!', 'Talentree', { timeOut: 2000, closeButton: true });
          this.adminCreated.emit();
        } else {
          this.error = res.message ?? 'Failed to create admin.';
          this._ToastrService.error(this.error!, 'Talentree', { timeOut: 2000, closeButton: true });
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? 'Failed to create admin.';
        this._ToastrService.error(this.error!, 'Talentree', { timeOut: 2000, closeButton: true });
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  ngOnDestroy(): void {
    if (this.createSub) this.createSub.unsubscribe();
  }
}