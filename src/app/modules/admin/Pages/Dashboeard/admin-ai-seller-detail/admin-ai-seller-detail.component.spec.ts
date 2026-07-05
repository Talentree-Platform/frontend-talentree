import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAiSellerDetailComponent } from './admin-ai-seller-detail.component';

describe('AdminAiSellerDetailComponent', () => {
  let component: AdminAiSellerDetailComponent;
  let fixture: ComponentFixture<AdminAiSellerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAiSellerDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAiSellerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
