import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistLoadingSkeltonComponent } from './wishlist-loading-skelton.component';

describe('WishlistLoadingSkeltonComponent', () => {
  let component: WishlistLoadingSkeltonComponent;
  let fixture: ComponentFixture<WishlistLoadingSkeltonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistLoadingSkeltonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistLoadingSkeltonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
