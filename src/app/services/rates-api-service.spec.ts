import { TestBed } from '@angular/core/testing';

import { RatesApiService } from './rates-api-service';

describe('RatesApiServiceTsService', () => {
  let service: RatesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
