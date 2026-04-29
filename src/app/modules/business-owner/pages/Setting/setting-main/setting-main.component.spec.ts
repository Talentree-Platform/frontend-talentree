import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingMainComponent } from './setting-main.component';

describe('SettingMainComponent', () => {
  let component: SettingMainComponent;
  let fixture: ComponentFixture<SettingMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
