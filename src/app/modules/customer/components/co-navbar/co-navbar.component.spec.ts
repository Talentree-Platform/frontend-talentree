import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoNavbarComponent } from './co-navbar.component';

describe('CoNavbarComponent', () => {
  let component: CoNavbarComponent;
  let fixture: ComponentFixture<CoNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoNavbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
