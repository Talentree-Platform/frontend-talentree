import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessChatComponent } from './business-chat.component';

describe('BusinessChatComponent', () => {
  let component: BusinessChatComponent;
  let fixture: ComponentFixture<BusinessChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BusinessChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
