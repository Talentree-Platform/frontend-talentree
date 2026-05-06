import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbHomeComponent } from './kb-home.component';

describe('KbHomeComponent', () => {
  let component: KbHomeComponent;
  let fixture: ComponentFixture<KbHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KbHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
