import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistLoadingSkeletonComponent } from './wishlist-loading-skelton.component';

describe('WishlistLoadingSkeletonComponent', () => {
  let component: WishlistLoadingSkeletonComponent;
  let fixture: ComponentFixture<WishlistLoadingSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistLoadingSkeletonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistLoadingSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
