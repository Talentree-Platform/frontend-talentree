import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAiInsightsComponent } from './admin-ai-insights.component';

describe('AdminAiInsightsComponent', () => {
  let component: AdminAiInsightsComponent;
  let fixture: ComponentFixture<AdminAiInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAiInsightsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAiInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
