import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartSummaryCardComponent } from './cart-summary-card.component';

describe('CartSummaryCardComponent', () => {
  let component: CartSummaryCardComponent;
  let fixture: ComponentFixture<CartSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartSummaryCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
