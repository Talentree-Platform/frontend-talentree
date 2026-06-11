import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OwnerSettingService } from '../../../core/services/owner-setting.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-setting-prefernce-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setting-prefernce-notifications.component.html',
  styleUrl: './setting-prefernce-notifications.component.css'
})
export class SettingPrefernceNotificationsComponent implements OnInit {

  form!: FormGroup;
  private toastr = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private settingService: OwnerSettingService
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      timezone: ['', Validators.required],
      dateFormat: ['', Validators.required],
      currencyDisplay: ['', Validators.required],
      dashboardLayout: ['', Validators.required]
    });

    this.loadPreferences();
  }

  // ================= LOAD =================
  loadPreferences(): void {
    this.settingService.getPreferences().subscribe({
      next: (res) => {
        const data = res.data;

        this.form.patchValue({
          timezone: data.timezone,
          dateFormat: data.dateFormat,
          currencyDisplay: data.currencyDisplay,
          dashboardLayout: data.dashboardLayout
        });
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load preferences', 'Talentree');
      }
    });
  }

  // ================= SAVE =================
  save(): void {
    if (this.form.invalid) return;

    this.settingService.updatePreferences(this.form.value).subscribe({
      next: (res) => {
        this.toastr.success('Preferences updated successfully', 'Talentree');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Update failed', 'Talentree');
      }
    });
  }
}