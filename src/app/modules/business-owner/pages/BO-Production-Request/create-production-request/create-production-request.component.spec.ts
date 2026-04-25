import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProductionRequestComponent } from './create-production-request.component';

describe('CreateProductionRequestComponent', () => {
  let component: CreateProductionRequestComponent;
  let fixture: ComponentFixture<CreateProductionRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProductionRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateProductionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
