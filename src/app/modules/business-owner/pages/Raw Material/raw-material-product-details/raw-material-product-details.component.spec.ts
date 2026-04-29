import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawMaterialProductDetailsComponent } from './raw-material-product-details.component';

describe('RawMaterialProductDetailsComponent', () => {
  let component: RawMaterialProductDetailsComponent;
  let fixture: ComponentFixture<RawMaterialProductDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawMaterialProductDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawMaterialProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
