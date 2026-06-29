import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistToggleBtnComponent } from './wishlist-toggle-btn.component';

describe('WishlistToggleBtnComponent', () => {
  let component: WishlistToggleBtnComponent;
  let fixture: ComponentFixture<WishlistToggleBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistToggleBtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistToggleBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
