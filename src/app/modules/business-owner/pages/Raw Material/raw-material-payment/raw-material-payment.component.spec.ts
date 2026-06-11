import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawMaterialPaymentComponent } from './raw-material-payment.component';

describe('RawMaterialPaymentComponent', () => {
  let component: RawMaterialPaymentComponent;
  let fixture: ComponentFixture<RawMaterialPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawMaterialPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawMaterialPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
