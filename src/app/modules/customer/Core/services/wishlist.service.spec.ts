import { TestBed } from '@angular/core/testing';

import { CustomerWishlistService } from './wishlist.service';

describe('CustomerWishlistService', () => {
  let service: CustomerWishlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerWishlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
