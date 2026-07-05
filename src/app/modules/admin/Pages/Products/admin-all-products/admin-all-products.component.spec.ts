import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAllProductsComponent } from './admin-all-products.component';

describe('AdminAllProductsComponent', () => {
  let component: AdminAllProductsComponent;
  let fixture: ComponentFixture<AdminAllProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAllProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAllProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
