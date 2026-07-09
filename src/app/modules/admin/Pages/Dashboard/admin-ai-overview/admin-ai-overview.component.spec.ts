import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAiOverviewComponent } from './admin-ai-overview.component';

describe('AdminAiOverviewComponent', () => {
  let component: AdminAiOverviewComponent;
  let fixture: ComponentFixture<AdminAiOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAiOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAiOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
