import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingBoComponent } from './pending-bo.component';

describe('PendingBoComponent', () => {
  let component: PendingBoComponent;
  let fixture: ComponentFixture<PendingBoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingBoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingBoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
