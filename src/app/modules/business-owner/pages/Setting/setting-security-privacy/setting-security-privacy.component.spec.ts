import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingSecurityPrivacyComponent } from './setting-security-privacy.component';

describe('SettingSecurityPrivacyComponent', () => {
  let component: SettingSecurityPrivacyComponent;
  let fixture: ComponentFixture<SettingSecurityPrivacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingSecurityPrivacyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingSecurityPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
