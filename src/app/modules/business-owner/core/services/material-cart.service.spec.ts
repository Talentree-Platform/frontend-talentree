import { TestBed } from '@angular/core/testing';

import { MaterialCartService } from './material-cart.service';

describe('MaterialCartService', () => {
  let service: MaterialCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
