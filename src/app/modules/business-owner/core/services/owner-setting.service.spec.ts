import { TestBed } from '@angular/core/testing';

import { OwnerSettingService } from './owner-setting.service';

describe('OwnerSettingService', () => {
  let service: OwnerSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwnerSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
