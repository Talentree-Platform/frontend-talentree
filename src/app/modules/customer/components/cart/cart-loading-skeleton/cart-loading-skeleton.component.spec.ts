import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartLoadingSkeletonComponent } from './cart-loading-skeleton.component';

describe('CartLoadingSkeletonComponent', () => {
  let component: CartLoadingSkeletonComponent;
  let fixture: ComponentFixture<CartLoadingSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartLoadingSkeletonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartLoadingSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
