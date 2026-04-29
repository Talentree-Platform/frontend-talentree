import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessOwnerComponent } from './business-owner.component';

describe('BusinessOwnerComponent', () => {
  let component: BusinessOwnerComponent;
  let fixture: ComponentFixture<BusinessOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessOwnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
