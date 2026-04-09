import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnotheriaedComponent } from './unotheriaed.component';

describe('UnotheriaedComponent', () => {
  let component: UnotheriaedComponent;
  let fixture: ComponentFixture<UnotheriaedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnotheriaedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnotheriaedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
