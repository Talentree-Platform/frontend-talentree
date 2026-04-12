import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawMaterialCartComponent } from './raw-material-cart.component';

describe('RawMaterialCartComponent', () => {
  let component: RawMaterialCartComponent;
  let fixture: ComponentFixture<RawMaterialCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawMaterialCartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawMaterialCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
