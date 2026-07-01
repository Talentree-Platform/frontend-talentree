import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyWishlistStateComponent } from './empty-wishlist-state.component';

describe('EmptyWishlistStateComponent', () => {
  let component: EmptyWishlistStateComponent;
  let fixture: ComponentFixture<EmptyWishlistStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyWishlistStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmptyWishlistStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
