import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyCartStateComponent } from './empty-cart-state.component';

describe('EmptyCartStateComponent', () => {
  let component: EmptyCartStateComponent;
  let fixture: ComponentFixture<EmptyCartStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyCartStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmptyCartStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
