import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { OwnerEditProductComponent } from './owner-edit-product.component';
import { BusinessOwnerProductsService } from '../../../core/services/business-owner-products.service';
import { OwnerProductDetail } from '../../../core/interfaces/owner-product';

describe('OwnerEditProductComponent', () => {
  let component: OwnerEditProductComponent;
  let fixture: ComponentFixture<OwnerEditProductComponent>;

  const mockDetail: OwnerProductDetail = {
    id: 1,
    name: 'Test',
    description: 'd',
    price: 10,
    stockQuantity: 5,
    tagsRaw: '',
    tagList: [],
    status: 1,
    statusText: 'Active',
    statusNormalized: 'active',
    categoryName: 'Electronics',
    categoryId: 1,
    mainImageUrl: 'https://example.com/a.jpg',
    images: ['https://example.com/a.jpg'],
    productImages: [{ id: 1, url: 'https://example.com/a.jpg' }],
    createdAt: null,
    updatedAt: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerEditProductComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (k: string) => (k === 'id' ? '1' : null) },
              queryParamMap: { get: () => null }
            }
          }
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        {
          provide: BusinessOwnerProductsService,
          useValue: {
            getProductById: () => of(mockDetail),
            updateProduct: () => of({})
          }
        },
        { provide: ToastrService, useValue: { success: (): void => {}, error: (): void => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerEditProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
