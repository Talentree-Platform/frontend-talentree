import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartErrorStateComponent } from './cart-error-state.component';

describe('CartErrorStateComponent', () => {
  let component: CartErrorStateComponent;
  let fixture: ComponentFixture<CartErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartErrorStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartErrorStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
