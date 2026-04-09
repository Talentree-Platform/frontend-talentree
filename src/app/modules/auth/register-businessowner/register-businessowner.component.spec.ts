import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterBusinessownerComponent } from './register-businessowner.component';

describe('RegisterBusinessownerComponent', () => {
  let component: RegisterBusinessownerComponent;
  let fixture: ComponentFixture<RegisterBusinessownerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterBusinessownerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterBusinessownerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
