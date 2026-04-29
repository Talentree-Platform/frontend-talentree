import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawMaterialCheckoutComponent } from './raw-material-checkout.component';

describe('RawMaterialCheckoutComponent', () => {
  let component: RawMaterialCheckoutComponent;
  let fixture: ComponentFixture<RawMaterialCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawMaterialCheckoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawMaterialCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
