import { TestBed } from '@angular/core/testing';

import { PayoutAdminService } from './admin-payout.service';

describe('PayoutAdminService', () => {
  let service: PayoutAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayoutAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
