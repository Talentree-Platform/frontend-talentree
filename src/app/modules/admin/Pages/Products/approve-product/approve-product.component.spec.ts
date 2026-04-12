import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveProductComponent } from './approve-product.component';

describe('ApproveProductComponent', () => {
  let component: ApproveProductComponent;
  let fixture: ComponentFixture<ApproveProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApproveProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
