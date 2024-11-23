import { TestBed } from '@angular/core/testing';

import { RatesDataService } from './rates-data.service';

describe('RatesDataService', () => {
  let service: RatesDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
