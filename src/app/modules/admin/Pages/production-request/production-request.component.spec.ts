import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionRequestComponent } from './production-request.component';

describe('ProductionRequestComponent', () => {
  let component: ProductionRequestComponent;
  let fixture: ComponentFixture<ProductionRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
