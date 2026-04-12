import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingBusinessDetailsComponent } from './setting-business-details.component';

describe('SettingBusinessDetailsComponent', () => {
  let component: SettingBusinessDetailsComponent;
  let fixture: ComponentFixture<SettingBusinessDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingBusinessDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingBusinessDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
