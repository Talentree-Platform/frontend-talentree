import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawMaterialHomeComponent } from './raw-material-home.component';

describe('RawMaterialHomeComponent', () => {
  let component: RawMaterialHomeComponent;
  let fixture: ComponentFixture<RawMaterialHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawMaterialHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawMaterialHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
