import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionRequestDetailsComponent } from './production-request-details.component';

describe('ProductionRequestDetailsComponent', () => {
  let component: ProductionRequestDetailsComponent;
  let fixture: ComponentFixture<ProductionRequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionRequestDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductionRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
