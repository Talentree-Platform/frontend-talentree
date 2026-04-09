import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectOwnerComponent } from './reject-owner.component';

describe('RejectOwnerComponent', () => {
  let component: RejectOwnerComponent;
  let fixture: ComponentFixture<RejectOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectOwnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RejectOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
