import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerProductDetailsComponent } from './owner-product-details.component';

describe('OwnerProductDetailsComponent', () => {
  let component: OwnerProductDetailsComponent;
  let fixture: ComponentFixture<OwnerProductDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerProductDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnerProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
