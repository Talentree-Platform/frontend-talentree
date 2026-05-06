import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbBookmarksComponent } from './kb-bookmarks.component';

describe('KbBookmarksComponent', () => {
  let component: KbBookmarksComponent;
  let fixture: ComponentFixture<KbBookmarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KbBookmarksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KbBookmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
