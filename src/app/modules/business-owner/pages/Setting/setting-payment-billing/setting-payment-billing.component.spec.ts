import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPaymentBillingComponent } from './setting-payment-billing.component';

describe('SettingPaymentBillingComponent', () => {
  let component: SettingPaymentBillingComponent;
  let fixture: ComponentFixture<SettingPaymentBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingPaymentBillingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingPaymentBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
