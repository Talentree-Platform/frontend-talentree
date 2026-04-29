import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoDetailsComponent } from './bo-details.component';

describe('BoDetailsComponent', () => {
  let component: BoDetailsComponent;
  let fixture: ComponentFixture<BoDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
