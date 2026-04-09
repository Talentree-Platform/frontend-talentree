import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerTopNavComponent } from './owner-top-nav.component';

describe('OwnerTopNavComponent', () => {
  let component: OwnerTopNavComponent;
  let fixture: ComponentFixture<OwnerTopNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerTopNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnerTopNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
