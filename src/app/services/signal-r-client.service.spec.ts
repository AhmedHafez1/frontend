import { TestBed } from '@angular/core/testing';

import { SignalRClientService } from './signal-r-client.service';

describe('RealTimeClientService', () => {
  let service: SignalRClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalRClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
