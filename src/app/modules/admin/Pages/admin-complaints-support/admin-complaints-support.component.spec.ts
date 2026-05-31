import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComplaintsSupportComponent } from './admin-complaints-support.component';

describe('AdminComplaintsSupportComponent', () => {
  let component: AdminComplaintsSupportComponent;
  let fixture: ComponentFixture<AdminComplaintsSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComplaintsSupportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminComplaintsSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
