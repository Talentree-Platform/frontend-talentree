import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestockModalComponent } from './restock-modal.component';

describe('RestockModalComponent', () => {
  let component: RestockModalComponent;
  let fixture: ComponentFixture<RestockModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestockModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
