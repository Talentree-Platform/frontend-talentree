import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeForcedPasswordComponent } from './change-forced-password.component';

describe('ChangeForcedPasswordComponent', () => {
  let component: ChangeForcedPasswordComponent;
  let fixture: ComponentFixture<ChangeForcedPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeForcedPasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeForcedPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
