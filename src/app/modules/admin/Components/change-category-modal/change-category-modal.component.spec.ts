import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCategoryModalComponent } from './change-category-modal.component';

describe('ChangeCategoryModalComponent', () => {
  let component: ChangeCategoryModalComponent;
  let fixture: ComponentFixture<ChangeCategoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeCategoryModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
