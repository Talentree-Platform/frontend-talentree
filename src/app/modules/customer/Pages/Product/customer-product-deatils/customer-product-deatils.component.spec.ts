import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerProductDeatilsComponent } from './customer-product-deatils.component';

describe('CustomerProductDeatilsComponent', () => {
  let component: CustomerProductDeatilsComponent;
  let fixture: ComponentFixture<CustomerProductDeatilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerProductDeatilsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerProductDeatilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
