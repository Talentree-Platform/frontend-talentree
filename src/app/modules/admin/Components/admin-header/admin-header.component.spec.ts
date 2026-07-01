import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTopNavComponent } from './admin-header.component';

describe('AdminTopNavComponent', () => {
  let component: AdminTopNavComponent;
  let fixture: ComponentFixture<AdminTopNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTopNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminTopNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
