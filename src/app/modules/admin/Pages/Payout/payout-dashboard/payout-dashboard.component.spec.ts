import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutDashboardComponent } from './payout-dashboard.component';

describe('PayoutDashboardComponent', () => {
  let component: PayoutDashboardComponent;
  let fixture: ComponentFixture<PayoutDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayoutDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PayoutDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
