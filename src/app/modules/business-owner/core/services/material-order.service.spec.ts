import { TestBed } from '@angular/core/testing';

import { MaterialOrderService } from './material-order.service';

describe('MaterialOrderService', () => {
  let service: MaterialOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
