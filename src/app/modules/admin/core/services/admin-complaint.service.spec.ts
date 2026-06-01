import { TestBed } from '@angular/core/testing';

import { AdminComplaintService } from './admin-complaint.service';

describe('AdminComplaintService', () => {
  let service: AdminComplaintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminComplaintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
