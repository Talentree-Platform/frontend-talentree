import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPreviewPanalComponent } from './checkout-preview-panal.component';

describe('CheckoutPreviewPanalComponent', () => {
  let component: CheckoutPreviewPanalComponent;
  let fixture: ComponentFixture<CheckoutPreviewPanalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPreviewPanalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckoutPreviewPanalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
