import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSideNavComponent } from './admin-side-nav.component';

describe('AdminSideNavComponent', () => {
  let component: AdminSideNavComponent;
  let fixture: ComponentFixture<AdminSideNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSideNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
