import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../../../core/services/checkout.service';
import { MaterialCartService } from '../../../core/services/material-cart.service';
import { BasketData, BasketItem } from '../../../core/interfaces/imaterial-cart';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-raw-material-checkout',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './raw-material-checkout.component.html',
  styleUrl: './raw-material-checkout.component.css'
})
export class RawMaterialCheckoutComponent {

  private fb = inject(FormBuilder);
  private checkoutService = inject(CheckoutService);
  private materialCartService = inject(MaterialCartService)
  private router = inject(Router);
  private _ToastrService= inject(ToastrService);

  isLoading = false;
  cartData!:BasketData<BasketItem>;
    cartItems!:BasketItem[];

  checkoutForm = this.fb.group({
    deliveryAddress: ['', [Validators.required, Validators.minLength(5)]],
    deliveryCity: ['', Validators.required],
    deliveryCountry: ['', Validators.required],
    contactPhone: ['', [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)]]
  });

  submit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formValue = this.checkoutForm.value;

    this.checkoutService.checkout(
      formValue.deliveryAddress!,
      formValue.deliveryCity!,
      formValue.deliveryCountry!,
      formValue.contactPhone!
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this._ToastrService.success(res.message || 'Order placed successfuly' , 'Talentree')
        // redirect to order success page (important)
        this.router.navigate(['/businessowner/materialOrder', res.data.id]);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
  ngOnInit(){
    this.getMaterialOrderSummary();
  }
  getMaterialOrderSummary(){
    this.materialCartService.getMaterialCart().subscribe({
      next:(res)=>{
        this.cartData=res.data;
        this.cartItems=res.data.items;
        console.log(res);
        
      },
      error:(err)=>{
        console.log(err);
        
      }}
    )
  }

  get f() {
    return this.checkoutForm.controls;
  }
}
