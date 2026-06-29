import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistSummaryCardComponent } from './wishlist-summary-card.component';

describe('WishlistSummaryCardComponent', () => {
  let component: WishlistSummaryCardComponent;
  let fixture: ComponentFixture<WishlistSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistSummaryCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
