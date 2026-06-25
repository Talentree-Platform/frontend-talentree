import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProfileData } from '../../../core/interfaces/i-setting';
import { Subscription } from 'rxjs';
import { OwnerSettingService } from '../../../core/services/owner-setting.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../core/environment/envirinment';

@Component({
  selector: 'app-setting-main',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './setting-main.component.html',
  styleUrl: './setting-main.component.css'
})
export class SettingMainComponent implements OnInit {  // ✅ implements OnInit
  isLoading = false;

  profilePhoto?: File;
  profilePreview: string | null = null;

  currentProfile: ProfileData | null = null;  // ✅ store profile for placeholders
  private profileSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private _OwnerSettingService: OwnerSettingService
  ) {}
  private readonly _ToastrService =inject(ToastrService)
  profileForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    phoneNumber: [''],
    email: ['', Validators.email],
  });

  ngOnInit(): void {
    this.loadCurrentProfile();
    console.log('preview', this.profilePreview);
    
  }

  loadCurrentProfile() {
    this.profileSub = this._OwnerSettingService.getCurrentProfile().subscribe({
      next: (res) => {
        this.currentProfile = res.data;  // ✅ unwrap .data

        // Split displayName into first/last (API has no separate fields)
        const [firstName, ...rest] = (res.data.displayName ?? '').split(' ');
        const lastName = rest.join(' ');

        // ✅ patch form so inputs show current values
        this.profileForm.patchValue({
          firstName,
          lastName,
          phoneNumber: res.data.phoneNumber,
          email: res.data.email,
        });

        // ✅ show existing profile photo
        if (res.data.profilePhotoUrl) {
          this.profilePreview = environment.AzureUrl + res.data.profilePhotoUrl;
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

  submit() {
    if (this.profileForm.invalid) return;
    this.isLoading = true;

    this._OwnerSettingService.updateProfile(
      this.profileForm.getRawValue(),
      this.profilePhoto
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Success:', res);
        this._ToastrService.info(res.message  , 'Talentree' , {timeOut:2000 , closeButton:true});
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