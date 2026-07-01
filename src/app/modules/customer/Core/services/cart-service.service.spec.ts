import { TestBed } from '@angular/core/testing';

import { CustomerCartService } from './cart-service.service';

describe('CustomerCartService', () => {
  let service: CustomerCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
