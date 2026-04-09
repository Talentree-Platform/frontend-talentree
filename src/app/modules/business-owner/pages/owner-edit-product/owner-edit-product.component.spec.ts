import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerEditProductComponent } from './owner-edit-product.component';

describe('OwnerEditProductComponent', () => {
  let component: OwnerEditProductComponent;
  let fixture: ComponentFixture<OwnerEditProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerEditProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnerEditProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
