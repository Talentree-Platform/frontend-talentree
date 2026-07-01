import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInteractionsComponent } from './admin-interactions.component';

describe('AdminInteractionsComponent', () => {
  let component: AdminInteractionsComponent;
  let fixture: ComponentFixture<AdminInteractionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInteractionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminInteractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
