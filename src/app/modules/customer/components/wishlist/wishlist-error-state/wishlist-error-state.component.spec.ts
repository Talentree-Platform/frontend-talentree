import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistErrorStateComponent } from './wishlist-error-state.component';

describe('WishlistErrorStateComponent', () => {
  let component: WishlistErrorStateComponent;
  let fixture: ComponentFixture<WishlistErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistErrorStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistErrorStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
