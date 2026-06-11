import { TestBed } from '@angular/core/testing';

import { BoSettingService } from './bo-setting.service';

describe('BoSettingService', () => {
  let service: BoSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
