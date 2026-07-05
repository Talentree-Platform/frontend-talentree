import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkRejectModalComponent } from './bulk-reject-modal.component';

describe('BulkRejectModalComponent', () => {
  let component: BulkRejectModalComponent;
  let fixture: ComponentFixture<BulkRejectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkRejectModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkRejectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
