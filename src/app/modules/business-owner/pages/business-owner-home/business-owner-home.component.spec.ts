import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessOwnerHomeComponent } from './business-owner-home.component';

describe('BusinessOwnerHomeComponent', () => {
  let component: BusinessOwnerHomeComponent;
  let fixture: ComponentFixture<BusinessOwnerHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessOwnerHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessOwnerHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
