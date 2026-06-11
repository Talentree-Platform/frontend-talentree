import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatuesBadgeComponent } from './statues-badge.component';

describe('StatuesBadgeComponent', () => {
  let component: StatuesBadgeComponent;
  let fixture: ComponentFixture<StatuesBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatuesBadgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatuesBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
