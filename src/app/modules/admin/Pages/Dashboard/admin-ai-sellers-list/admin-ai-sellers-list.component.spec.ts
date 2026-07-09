import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAiSellersListComponent } from './admin-ai-sellers-list.component';

describe('AdminAiSellersListComponent', () => {
  let component: AdminAiSellersListComponent;
  let fixture: ComponentFixture<AdminAiSellersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAiSellersListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAiSellersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
