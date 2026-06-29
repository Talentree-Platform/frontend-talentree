import { TestBed } from '@angular/core/testing';

import { CustomerMarketplaceService } from './customer-marketplace.service';

describe('CustomerMarketplaceService', () => {
  let service: CustomerMarketplaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerMarketplaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
