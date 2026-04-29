import { ToastrService } from 'ngx-toastr';
import { AdminService, CreateAdminDto } from '../../../core/services/admin.service';
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
    private _AdminService: AdminService,
    private _ToastrService: ToastrService
  ) {}

  createSub!: Subscription;
  loading = false;
  error: string | null = null;

  form: CreateAdminDto = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  };

  submit(): void {
    this.error = null;

    if (this.form.password !== this.form.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.createSub = this._AdminService.createAdmin(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        this.adminCreated.emit();
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