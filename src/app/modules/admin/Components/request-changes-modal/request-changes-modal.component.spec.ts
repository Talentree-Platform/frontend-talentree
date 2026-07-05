import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestChangesModalComponent } from './request-changes-modal.component';

describe('RequestChangesModalComponent', () => {
  let component: RequestChangesModalComponent;
  let fixture: ComponentFixture<RequestChangesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestChangesModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestChangesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
