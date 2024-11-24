import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ExchangeRates } from '../models/exchange-rates.model';
import { environment } from '../../environments/environment';
import { RatesApiService } from './rates-api.service';

describe('RatesApiService', () => {
  let service: RatesApiService;
  let httpMock: HttpTestingController;

  const mockExchangeRates: ExchangeRates = {
    base: 'USD',
    rates: {
      EUR: 1.2,
      GBP: 0.8,
    },
    date: '2024-11-24',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RatesApiService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(RatesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensure no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch exchange rates with the default base currency (USD)', () => {
    service.getRates().subscribe((data) => {
      expect(data).toEqual(mockExchangeRates);
    });

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url === environment.apiUrl + 'currencies'
    );

    expect(req.request.params.has('baseCurrency')).toBeTrue();
    expect(req.request.params.get('baseCurrency')).toBe('USD');

    req.flush(mockExchangeRates); // Mock the API response
  });

  it('should fetch exchange rates with a custom base currency', () => {
    const customBaseCurrency = 'EUR';
    service.getRates(customBaseCurrency).subscribe((data) => {
      expect(data).toEqual(mockExchangeRates);
    });

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url === environment.apiUrl + 'currencies'
    );

    expect(req.request.params.has('baseCurrency')).toBeTrue();
    expect(req.request.params.get('baseCurrency')).toBe(customBaseCurrency);

    req.flush(mockExchangeRates); // Mock the API response
  });

  it('should handle error response gracefully', () => {
    const errorMessage = 'Failed to fetch exchange rates';

    service.getRates().subscribe(
      () => fail('should have failed with an error'),
      (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      }
    );

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url === environment.apiUrl + 'currencies'
    );

    req.flush(errorMessage, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});
