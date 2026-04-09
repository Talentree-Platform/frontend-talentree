import { Subscription } from 'rxjs';
import { MaterialCartService } from './../../core/services/material-cart.service';
import { Component } from '@angular/core';
import { ApiResponse } from '../../core/interfaces/material';
import { BasketData, BasketItem } from '../../core/interfaces/imaterial-cart';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-raw-material-cart',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './raw-material-cart.component.html',
  styleUrl: './raw-material-cart.component.css'
})
export class RawMaterialCartComponent {
  constructor(private _MaterialCartService:MaterialCartService){}
  getCartSub!:Subscription;
  removeItemSub!:Subscription;
  removeAllSub!:Subscription;
  cartData!:BasketData<BasketItem>;
  cartItems!:BasketItem[];
  quentity!:number;
  ngOnInit(){
    this.getMaterialCart();
  }
  getMaterialCart(){
    this.getCartSub=this._MaterialCartService.getMaterialCart().subscribe({
      next:(res)=>{
        this.cartData=res.data;
        this.cartItems=res.data.items;
        console.log(this.cartData);
      },
      error:(err)=>{console.log(err);
      }
    })
  }

  increaseQuentity(id:number){
    this.quentity=this.quentity+1;
    this._MaterialCartService.updateQuantity(id,this.quentity).subscribe({
      next:(res)=>{console.log(res)},
      error:(err)=>{console.log(err)}
      
    })
  }
  decreaseQuentity(id: number) {
  if(this.quentity > this.cartItems[id].minimumOrderQuantity) { // prevent going below min
    this.quentity = this.quentity-1;
    this._MaterialCartService.updateQuantity(id, this.quentity).subscribe({
      next: (res) => console.log(res),
      error: (err) => console.log(err)
    });
  }
}

  //Remove from cart
  removeItemFromCart(id:number){
    this.removeItemSub=this._MaterialCartService.removeMaterialFromCart(id).subscribe({
      next:(res)=>{console.log(res);
        this.getMaterialCart();
      },
      error:(err)=>{console.log(err);
      }
    })
  }
  removeAll(){
    this.removeAllSub= this._MaterialCartService.removeAll().subscribe({
      next:(res)=>{console.log(res);
      this.cartItems=[];
      },
      error:(err)=>{console.log(err);
      }
    })
  }


  ngOnDestroy(){
    this.getCartSub?.unsubscribe();
    this.removeItemSub?.unsubscribe();
    this.removeAllSub?.unsubscribe();
  }
}
