import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutPreviewPanelComponent } from './checkout-preview-panal.component';

describe('CheckoutPreviewPanelComponent', () => {
  let component: CheckoutPreviewPanelComponent;
  let fixture: ComponentFixture<CheckoutPreviewPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutPreviewPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckoutPreviewPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
