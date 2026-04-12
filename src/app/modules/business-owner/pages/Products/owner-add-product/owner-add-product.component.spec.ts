import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { OwnerAddProductComponent } from './owner-add-product.component';
import { BusinessOwnerProductsService } from '../../../core/services/business-owner-products.service';

describe('OwnerAddProductComponent', () => {
  let component: OwnerAddProductComponent;
  let fixture: ComponentFixture<OwnerAddProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerAddProductComponent, HttpClientTestingModule],
      providers: [
        {
          provide: BusinessOwnerProductsService,
          useValue: { createProduct: () => of({}) }
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ToastrService, useValue: { success: (): void => {}, error: (): void => {} } }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnerAddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
