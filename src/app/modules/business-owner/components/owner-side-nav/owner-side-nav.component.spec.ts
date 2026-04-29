import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerSideNavComponent } from './owner-side-nav.component';

describe('OwnerSideNavComponent', () => {
  let component: OwnerSideNavComponent;
  let fixture: ComponentFixture<OwnerSideNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerSideNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OwnerSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
