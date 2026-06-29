import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistItemCardComponent } from './wishlist-item-card.component';

describe('WishlistItemCardComponent', () => {
  let component: WishlistItemCardComponent;
  let fixture: ComponentFixture<WishlistItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistItemCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
