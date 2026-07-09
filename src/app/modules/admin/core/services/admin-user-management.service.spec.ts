import { TestBed } from '@angular/core/testing';

import { AdminUserManagementService } from './admin-user-management.service';

describe('AdmiUserManagementService', () => {
  let service: AdminUserManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminUserManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
