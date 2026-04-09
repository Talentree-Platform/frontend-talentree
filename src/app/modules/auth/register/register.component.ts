import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error = '';        // ✅ Keep this one
  success = '';      // ✅ Keep this one
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.error = '';
    this.success = '';  
    
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordComplexityValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)]],
      role: ['Customer', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // src/app/modules/auth/register/register.component.ts

onSubmit() {
  // Mark all fields as touched to show validation errors
  this.markFormGroupTouched(this.registerForm);
  
  if (this.registerForm.invalid) {
    this.isLoading = false;
    return;
  }

  this.isLoading = true;
  this.error = '';
  this.success = '';
  
  // ✅ Send form data to auth service
  this.authService.register(this.registerForm.value).subscribe({
    next: (response: any) => {
      this.isLoading = false;
      this.success = 'Registration successful! Please verify your email.';
      
      // ❌ REMOVE THIS LINE - Let the service handle navigation
      // this.router.navigate(['/verify-email']);
      
      // ✅ Instead, just show success message
      console.log('✅ Registration successful - service will redirect');
      
      // Optional: Clear form
      this.registerForm.reset();
      this.registerForm.patchValue({ 
        role: 'Customer', 
        acceptTerms: false,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
      });
    },
    error: (error: any) => {
      this.isLoading = false;
      
      // Handle validation errors
      if (error.error?.errors) {
        const firstErrorKey = Object.keys(error.error.errors)[0];
        this.error = error.error.errors[firstErrorKey][0];
      } else {
        this.error = error.error?.message || 'Registration failed. Please try again.';
      }
    }
  });
}

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';
    
    const errors = field.errors;
    
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) {
      if (fieldName === 'firstName' || fieldName === 'lastName') {
        return 'Must be at least 2 characters';
      }
      return 'Must be at least 8 characters';
    }
    if (errors['pattern']) {
      if (fieldName === 'phoneNumber') {
        return 'Invalid phone number format';
      }
    }
    if (errors['requiredTrue'] && fieldName === 'acceptTerms') {
      return 'You must accept the terms and conditions';
    }
    
    if (errors['missingUpperCase']) return 'Must contain uppercase letter (A-Z)';
    if (errors['missingLowerCase']) return 'Must contain lowercase letter (a-z)';
    if (errors['missingNumber']) return 'Must contain number (0-9)';
    if (errors['missingSpecialChar']) return 'Must contain special character (!@#$%...)';
    
    return '';
  }

  getFormError(): string {
    const errors = this.registerForm.errors;
    if (errors && errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  testRegistration(): void {
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Test123!',
      confirmPassword: 'Test123!',
      phoneNumber: '+966500000000',
      role: 'Customer',
      acceptTerms: true
    };
    
    this.registerForm.patchValue(testData);
    this.registerForm.markAllAsTouched();
  }

  testDifferentRoles(): void {
    const testRoles = ['Customer', 'BusinessOwner', 'Supplier', 'Admin'];
    console.log('Testing roles:', testRoles);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onInputChange(): void {
    if (this.error) {
      this.error = '';
    }
  }
}