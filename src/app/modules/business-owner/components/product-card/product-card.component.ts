import { Component , Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialCartService } from '../../core/services/material-cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  constructor(private _MaterialCartService:MaterialCartService){}
  @Input() id!:number;
  @Input() image!: string|null;
  @Input() title!: string;
  @Input() type!: string;
  @Input() minQuantity!: number;
  @Input() price!: number;
  @Input() colors!: string;
  @Input() vendor!: string;
  
  @Input() addMaterialToCart!: (id: number, quantity: number) => void;
  quentity!:number;
  ngOnInit(){
    this.quentity=this.minQuantity
  }
  
}

