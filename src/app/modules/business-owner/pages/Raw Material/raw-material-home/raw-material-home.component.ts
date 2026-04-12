import { MaterialCartService } from '../../../core/services/material-cart.service';
import { FormsModule } from '@angular/forms';
import { MaterialService } from '../../../core/services/material.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Material } from '../../../core/interfaces/material';
import { Component, inject } from '@angular/core';
import { ProductCardComponent } from "../../../components/product-card/product-card.component";
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';
import { log } from 'node:console';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-raw-material-home',
  standalone: true,
  imports: [ProductCardComponent,CarouselModule, FormsModule , RouterLink],
  templateUrl: './raw-material-home.component.html',
  styleUrl: './raw-material-home.component.css'
})
export class RawMaterialHomeComponent {
  constructor(private _MaterialService:MaterialService , private _MaterialCartService:MaterialCartService){}
  private readonly _ToastrService =inject(ToastrService)
  //owl caroseal options
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    autoplay:true,
    autoplayTimeout:2000,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    items:1,
    nav: true,
  }

  //objects
  materials :Material[] =[];
  pageIndex :number =1 ;
  pageSize:number =20;
  materialId!:number;
  totalCount!:number ;
  totalPages! :number ;

  hasNext !:boolean;
  hasPrevious!: boolean;
  
  materialSub!:Subscription;
  // Filter fields (bound to inputs)
  searchName = '';
  categoryChoise='';
  searchVendor = '';
  minQtyFilter: number | null = null;
  ngOnInit():void{
    this.loadMaterials()
  }
  loadMaterials(){
    
    this.materialSub=this._MaterialService.getMaterials({ category: this.categoryChoise,'search':this.searchName, pageIndex: this.pageIndex, pageSize: this.pageSize }).subscribe({
      next:(res)=>{
        this.materials=res.data.data;
        this.totalCount = res.data.count;
        this.totalPages = res.data.totalPages;
        this.hasNext=res.data.hasNext;
        this.hasPrevious=res.data.hasPrevious;
        this.materialId = res.data.data[0].id;
        console.log(res)},
      error:(err)=>{console.log(err);
      }
    })
  }

  nextPage(){
    if(this.pageIndex<this.totalPages){
      this.pageIndex++;
      this.loadMaterials()
    }
  }
  previousPage(){
    if(this.pageIndex>1){
      this.pageIndex--;
      this.loadMaterials();
    }
  }

  goToPage(page: number) {
  this.pageIndex = page;      // تحديث الصفحة الحالية
  this.loadMaterials();            // تحميل البيانات الخاصة بالصفحة الجديدة
}

  applyFilterName(){
    this.loadMaterials();
  }


  //Add to Cart
  addMaterialToCart = (id: number, quantity: number) => {
  this._MaterialCartService.addMaterialToCart(id, quantity).subscribe({
    next:(res)=>{
      console.log('post res', res);
      this._ToastrService.success(res.message , 'Talentree' , {timeOut:2000 , closeButton:true})
    },
    error:(err)=>{
      console.log(err);
      const errorMessage =
        err?.error?.errors && err.error.errors.length > 0
          ? err.error.errors[0]
          : 'An unexpected error occurred';

      this._ToastrService.error(errorMessage, 'Talentree', {
        timeOut: 2000,
        closeButton: true
      });
    }
  })
}
  ngOnDestroy(){
    this.materialSub?.unsubscribe();
  }
  

  
  

  

  
}

