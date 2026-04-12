import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectProductComponent } from './reject-product.component';

describe('RejectProductComponent', () => {
  let component: RejectProductComponent;
  let fixture: ComponentFixture<RejectProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RejectProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
