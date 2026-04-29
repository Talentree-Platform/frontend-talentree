import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawMaterialFormComponent } from './raw-material-form.component';

describe('RawMaterialFormComponent', () => {
  let component: RawMaterialFormComponent;
  let fixture: ComponentFixture<RawMaterialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawMaterialFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RawMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
