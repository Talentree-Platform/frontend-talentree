import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsAnalyticsComponent } from './transactions-analytics.component';

describe('TransactionsAnalyticsComponent', () => {
  let component: TransactionsAnalyticsComponent;
  let fixture: ComponentFixture<TransactionsAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsAnalyticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionsAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
