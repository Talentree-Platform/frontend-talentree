import { Subscription } from 'rxjs';
import { MaterialCartService } from '../../../core/services/material-cart.service';
import { Component } from '@angular/core';
import { ApiResponse } from '../../../core/interfaces/material';
import { BasketData, BasketItem } from '../../../core/interfaces/imaterial-cart';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-raw-material-cart',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,FormsModule],
  templateUrl: './raw-material-cart.component.html',
  styleUrl: './raw-material-cart.component.scss'
})
export class RawMaterialCartComponent {
  constructor(private _MaterialCartService:MaterialCartService){}
  getCartSub!:Subscription;
  removeItemSub!:Subscription;
  removeAllSub!:Subscription;
  cartData:BasketData<BasketItem>| null = null;
  cartItems:BasketItem[]=[];
  quentity!:number;
  cartItemsLength:number =0;
  ngOnInit(){
    this.getMaterialCart();
  }
  getMaterialCart(){
    this.getCartSub=this._MaterialCartService.getMaterialCart().subscribe({
      next:(res)=>{
        this.cartData=res.data;
        this.cartItems=res.data.items;
        this.cartItemsLength=res.data.items.length;
        console.log(this.cartData);
        // 🔥 هنا نبعث العدد للـ navbar
      this._MaterialCartService.setCount(this.cartItemsLength);
      },
      error:(err)=>{console.log(err);
      }
    })
  }

  increaseQuentity(item: BasketItem) {
  const newQty = item.quantity + 1;

  this._MaterialCartService.updateQuantity(item.id, newQty).subscribe({
    next: (res) => {
      item.quantity = newQty; // update UI instantly
    },
    error: (err) => console.log(err)
  });
}
  decreaseQuentity(item: BasketItem) {
  if (item.quantity > item.minimumOrderQuantity) {
    const newQty = item.quantity - 1;

    this._MaterialCartService.updateQuantity(item.id, newQty).subscribe({
      next: (res) => {
        item.quantity = newQty;
      },
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
      this._MaterialCartService.setCount(0);
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
