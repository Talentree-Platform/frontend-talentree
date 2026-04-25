import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionRequestListComponent } from './production-request-list.component';

describe('ProductionRequestListComponent', () => {
  let component: ProductionRequestListComponent;
  let fixture: ComponentFixture<ProductionRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionRequestListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductionRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
