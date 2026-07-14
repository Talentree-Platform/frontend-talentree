import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ProfileData } from '../../../core/interfaces/i-setting';
import { Subscription } from 'rxjs';
import { OwnerSettingService } from '../../../core/services/owner-setting.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../core/environment/envirinment';
import { resolveMediaUrl } from '../../../../../core/utils/media-url.util';

@Component({
  selector: 'app-setting-main',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './setting-main.component.html',
  styleUrl: './setting-main.component.css'
})
export class SettingMainComponent implements OnInit, OnDestroy {
  isLoading = false;

  profilePhoto?: File;
  profilePreview: string | null = null;
  readonly defaultAvatar = 'https://i.pinimg.com/736x/0f/68/94/0f6894e539589a50809e45833c8bb6c4.jpg';

  currentProfile: ProfileData | null = null;
  private profileSub?: Subscription;

  // ── Floating-label focus flags ──────────────────────────────
  firstNameFocus = false;
  lastNameFocus  = false;
  emailFocus     = false;
  phoneFocus     = false;

  constructor(
    private fb: FormBuilder,
    private _OwnerSettingService: OwnerSettingService
  ) {}

  private readonly _ToastrService = inject(ToastrService);

  profileForm = this.fb.group({
    firstName:   [''],
    lastName:    [''],
    phoneNumber: [''],
    email:       ['', Validators.email],
  });

  ngOnInit(): void {
    this.loadCurrentProfile();
  }

  loadCurrentProfile() {
    this.profileSub = this._OwnerSettingService.getCurrentProfile().subscribe({
      next: (res) => {
        this.currentProfile = res.data;

        const [firstName, ...rest] = (res.data.displayName ?? '').split(' ');
        const lastName = rest.join(' ');

        this.profileForm.patchValue({
          firstName,
          lastName,
          phoneNumber: res.data.phoneNumber,
          email: res.data.email,
        });

        if (res.data.profilePhotoUrl) {
          this.profilePreview = resolveMediaUrl(environment.AzureUrl, res.data.profilePhotoUrl);
        }
      },
      error: (err) => console.error(err)
    });
  }

  onProfilePhotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profilePhoto = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.defaultAvatar) {
      img.src = this.defaultAvatar;
    }
  }

  submit() {
    if (this.profileForm.invalid) return;
    this.isLoading = true;

    this._OwnerSettingService.updateProfile(
      this.profileForm.getRawValue(),
      this.profilePhoto
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this._ToastrService.info(res.message, 'Talentree', { timeOut: 2000, closeButton: true });
        this._OwnerSettingService.refreshCurrentProfile();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
  }
}