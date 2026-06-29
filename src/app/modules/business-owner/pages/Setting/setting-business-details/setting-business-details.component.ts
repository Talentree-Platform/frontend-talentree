import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OwnerSettingService } from '../../../core/services/owner-setting.service';
import { environment } from '../../../../../core/environment/envirinment';

@Component({
  selector: 'app-setting-business-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './setting-business-details.component.html',
  styleUrl: './setting-business-details.component.css'
})
export class SettingBusinessDetailsComponent implements OnInit {

  businessForm!: ReturnType<FormBuilder['group']>;

  // ─── Logo ─────────────────────────────────────────────────────
  logoFile?: File;
  logoPreview: string | null = null;

  // ─── Spinner ──────────────────────────────────────────────────
  isSaving = false;

  // ─── Floating-label focus trackers ───────────────────────────
  nameFocus = false;
  addrFocus = false;
  webFocus  = false;
  fbFocus   = false;
  igFocus   = false;
  descFocus = false;

  // ─── Services ─────────────────────────────────────────────────
  private baseUrl           = environment.AzureUrl;
  private readonly _toastr  = inject(ToastrService);
  private readonly _fb      = inject(FormBuilder);
  private readonly service  = inject(OwnerSettingService);

  // ═══════════════════════════════════════════════════════════════
  //  LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.businessForm = this._fb.group({
      businessName: [''],
      address:      [''],
      website:      [''],
      facebook:     [''],
      instagram:    [''],
      description:  ['']
    });

    this.loadData();
  }

  // ═══════════════════════════════════════════════════════════════
  //  LOAD
  // ═══════════════════════════════════════════════════════════════
  loadData(): void {
    this.service.getCurrentProfile().subscribe({
      next: (res) => {
        this.businessForm.patchValue({
          businessName: res.data.businessName,
          address:      res.data.businessAddress,
          website:      res.data.websiteLink,
          facebook:     res.data.facebookLink,
          instagram:    res.data.instagramLink,
          description:  res.data.businessDescription
        });

        if (res.data.businessLogoUrl) {
          this.logoPreview = this.baseUrl + res.data.businessLogoUrl;
        }
      },
      error: (err) => {
        console.error(err);
        this._toastr.error('Failed to load business details', 'Talentree');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  LOGO CHANGE
  // ═══════════════════════════════════════════════════════════════
  onLogoChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.logoFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ═══════════════════════════════════════════════════════════════
  //  SUBMIT
  // ═══════════════════════════════════════════════════════════════
  submit(): void {
    this.isSaving = true;

    this.service.updateProfile(
      this.businessForm.getRawValue(),
      undefined,       // no profile photo on this form
      this.logoFile    // business logo
    ).subscribe({
      next: (res) => {
        this.isSaving = false;
        this._toastr.success(res.message, 'Talentree');
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this._toastr.error('Failed to save business details', 'Talentree');
      }
    });
  }
}