import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OwnerSettingService } from '../../../core/services/owner-setting.service';

@Component({
  selector: 'app-setting-business-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './setting-business-details.component.html',
  styleUrl: './setting-business-details.component.css'
})
export class SettingBusinessDetailsComponent implements OnInit {

  businessForm = this.fb.group({
    businessName: [''],
    address: [''],
    website: [''],
    facebook: [''],
    instagram: [''],
    description: ['']
  });

  logoFile?: File;
  logoPreview: string | null = null;

  private baseUrl = 'https://backtalentree.runasp.net';
  private readonly _ToastrService=inject(ToastrService)

  constructor(
    private fb: FormBuilder,
    private service: OwnerSettingService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service.getCurrentProfile().subscribe({
      next: (res) => {

        this.businessForm.patchValue({
          businessName: res.data.businessName,
          address: res.data.businessAddress,
          website: res.data.websiteLink,
          facebook: res.data.facebookLink,
          instagram: res.data.instagramLink,
          description: res.data.businessDescription
        });

        // ✅ show logo
        if (res.data.businessLogoUrl) {
          this.logoPreview = this.baseUrl + res.data.businessLogoUrl;
        }
      }
    });
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.logoFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  submit() {
    this.service.updateProfile(
      this.businessForm.getRawValue(),
      undefined,          // no profile photo here
      this.logoFile       // business logo
    ).subscribe({
      next: (res) => {
        this.loadData(); // refresh after save
        this._ToastrService.success(res.message , 'Talentree' )
      },
      error: (err) => console.error(err)
    });
  }
}