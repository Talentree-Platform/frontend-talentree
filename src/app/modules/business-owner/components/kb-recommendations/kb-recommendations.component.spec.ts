import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbRecommendationsComponent } from './kb-recommendations.component';

describe('KbRecommendationsComponent', () => {
  let component: KbRecommendationsComponent;
  let fixture: ComponentFixture<KbRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbRecommendationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KbRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
