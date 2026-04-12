import { MaterialCartService } from '../../../core/services/material-cart.service';
import { Material } from '../../../core/interfaces/material';
import { ActivatedRoute } from '@angular/router';
import { MaterialService } from '../../../core/services/material.service';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-raw-material-product-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './raw-material-product-details.component.html',
  styleUrl: './raw-material-product-details.component.css'
})
export class RawMaterialProductDetailsComponent {
  constructor(private _MaterialService:MaterialService ,private route: ActivatedRoute ,private _MaterialCartService:MaterialCartService){}
  materialId :number= Number(this.route.snapshot.paramMap.get('id'));
  materialDetails!:Material;
  materialSub!:Subscription;
  cartSub!:Subscription;
  quentity!:number;
  ngOnInit(){
    this.loadMaterialDetails();
    
  }
  loadMaterialDetails(){
    this.materialSub=this._MaterialService.getMaterialById(this.materialId).subscribe(
      {
        next:(res)=>{
          this.materialDetails=res.data;
          this.quentity=res.data.minimumOrderQuantity;
          console.log(res);
        },
        error:(err)=>{console.log(err);
        }
      }
    )
  }
  addMaterialToCart( ){
    this.cartSub=this._MaterialCartService.addMaterialToCart(this.materialId,this.quentity).subscribe({
      next:(res)=>{console.log(res);
      },
      error:(err)=>{console.log(err);
      }
    })
  }
  ngOnDestroy(){
    this.materialSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }
}
