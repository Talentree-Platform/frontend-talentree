import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAiModelManagementComponent } from './admin-ai-model-management.component';

describe('AdminAiModelManagementComponent', () => {
  let component: AdminAiModelManagementComponent;
  let fixture: ComponentFixture<AdminAiModelManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAiModelManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAiModelManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
