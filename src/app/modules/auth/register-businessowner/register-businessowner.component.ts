import { AuthService } from './../services/auth.service';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { error } from 'console';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-businessowner',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-businessowner.component.html',
  styleUrl: './register-businessowner.component.scss'
})
export class RegisterBusinessownerComponent {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage !: string;
  success !:string;
  constructor(private fb: FormBuilder, private _AuthService: AuthService ,private _Router:Router) { }
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordComplexityValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(?:\+20|0)1[0-2,5]{1}[0-9]{8}$/)]],
      businessName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      businessCategory: ['', [Validators.required]],
      businessDescription: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      businessAddress: ['', [Validators.required]],
      taxId: ['', [Validators.required, Validators.pattern(/^(\d{9}|\d{14})$/)]],
      facebookLink: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/\S*)?$/)]],
      instagramLink: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/\S*)?$/)]],
      websiteLink: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/\S*)?$/)]]
    }
      , { validators: this.passwordMatchValidator }
    )
  }

  private passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(value);

    const errors: ValidationErrors = {};

    if (value.length < 8) errors['minlength'] = true;
    if (!hasUpperCase) errors['missingUpperCase'] = true;
    if (!hasLowerCase) errors['missingLowerCase'] = true;
    if (!hasNumber) errors['missingNumber'] = true;
    if (!hasSpecialChar) errors['missingSpecialChar'] = true;

    return Object.keys(errors).length > 0 ? errors : null;
  }
  private passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    console.log(this.registerForm)
    //Call register Api
    this._AuthService.registerOwner(this.registerForm.value).subscribe(
      {
        next: (res) => { console.log(res)
          this.success = 'Registration successful! Please verify your email.';
          this.isLoading=false;
          setInterval( () =>{this._Router.navigate(['/auth/verify-email'])},2000)
          
         },
        error: (error) => { console.log(error)
          this.errorMessage = error.error.message;
         },
        complete: () => { }


      }

    )
    if (this.registerForm.invalid) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  isFieldValid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }
  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showConfirmPassword;
    }
    else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

}
