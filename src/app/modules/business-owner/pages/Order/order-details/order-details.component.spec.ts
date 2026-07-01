import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialOrderDetailsComponent } from './order-details.component';

describe('MaterialOrderDetailsComponent', () => {
  let component: MaterialOrderDetailsComponent;
  let fixture: ComponentFixture<MaterialOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialOrderDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaterialOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
