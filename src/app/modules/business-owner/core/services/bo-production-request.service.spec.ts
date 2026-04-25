import { TestBed } from '@angular/core/testing';

import { BoProductionRequestService } from './bo-production-request.service';

describe('BoProductionRequestService', () => {
  let service: BoProductionRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoProductionRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
