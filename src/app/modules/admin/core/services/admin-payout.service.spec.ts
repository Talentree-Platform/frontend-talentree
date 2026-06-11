import { TestBed } from '@angular/core/testing';

import { AdminPayoutService } from './admin-payout.service';

describe('AdminPayoutService', () => {
  let service: AdminPayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminPayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
