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

  // ─── Floating-label focus trackers ───────────────────────────
  tzFocus     = false;
  dateFocus   = false;
  currFocus   = false;
  layoutFocus = false;

  // ─── Save spinner ─────────────────────────────────────────────
  isSaving = false;

  // ─── Services ─────────────────────────────────────────────────
  private toastr         = inject(ToastrService);
  private fb             = inject(FormBuilder);
  private settingService = inject(OwnerSettingService);

  // ═══════════════════════════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.form = this.fb.group({
      timezone:        ['', Validators.required],
      dateFormat:      ['', Validators.required],
      currencyDisplay: ['', Validators.required],
      dashboardLayout: ['', Validators.required]
    });

    this.loadPreferences();
  }

  // ═══════════════════════════════════════════════════════════════
  //  LOAD
  // ═══════════════════════════════════════════════════════════════
  loadPreferences(): void {
    this.settingService.getPreferences().subscribe({
      next: (res) => {
        const data = res.data;
        this.form.patchValue({
          timezone:        data.timezone,
          dateFormat:      data.dateFormat,
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

  // ═══════════════════════════════════════════════════════════════
  //  SAVE
  // ═══════════════════════════════════════════════════════════════
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.settingService.updatePreferences(this.form.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.toastr.success('Preferences updated successfully', 'Talentree');
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toastr.error('Update failed. Please try again.', 'Talentree');
      }
    });
  }
}