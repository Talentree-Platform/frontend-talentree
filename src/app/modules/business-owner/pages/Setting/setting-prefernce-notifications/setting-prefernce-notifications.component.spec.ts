import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPrefernceNotificationsComponent } from './setting-prefernce-notifications.component';

describe('SettingPrefernceNotificationsComponent', () => {
  let component: SettingPrefernceNotificationsComponent;
  let fixture: ComponentFixture<SettingPrefernceNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingPrefernceNotificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingPrefernceNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
