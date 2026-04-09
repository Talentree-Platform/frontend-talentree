import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerAddProductComponent } from './owner-add-product.component';

describe('OwnerAddProductComponent', () => {
  let component: OwnerAddProductComponent;
  let fixture: ComponentFixture<OwnerAddProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerAddProductComponent]
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
