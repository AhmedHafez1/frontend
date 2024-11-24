import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RatesDataService } from './rates-data.service';
import { SignalRClientService } from './signal-r-client.service';
import { RatesAdapterService } from './rates-adapter.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CurrencyRate } from '../models/currency-rate.model';
import { RatesApiService } from './rates-api.service';
import { ColorCode } from '../models/color-code.enum';
import { ExchangeRates } from '../models/exchange-rates.model';

describe('RatesDataService', () => {
  let service: RatesDataService;
  let apiServiceSpy: jasmine.SpyObj<RatesApiService>;
  let signalRServiceSpy: jasmine.SpyObj<SignalRClientService>;
  let ratesAdapterServiceSpy: jasmine.SpyObj<RatesAdapterService>;
  let signalRSubject: BehaviorSubject<any>;

  const mockExchangeRates: ExchangeRates = {
    date: '2024-01-25',
    base: 'USD',
    rates: {
      EUR: 0.85,
      GBP: 3.65,
    },
  };

  const mockMappedRates: [CurrencyRate[], Date] = [
    [
      {
        baseCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.85,
        percentage: 0,
        color: ColorCode.GRAY,
      },
      {
        baseCurrency: 'USD',
        toCurrency: 'QAR',
        rate: 3.65,
        percentage: 0.5,
        color: ColorCode.GREEN,
      },
    ],
    new Date(),
  ];

  beforeEach(() => {
    signalRSubject = new BehaviorSubject<any>(null);

    apiServiceSpy = jasmine.createSpyObj('RatesApiService', ['getRates']);
    signalRServiceSpy = jasmine.createSpyObj('SignalRClientService', [], {
      rates$: signalRSubject.asObservable(),
    });
    ratesAdapterServiceSpy = jasmine.createSpyObj('RatesAdapterService', [
      'mapRates',
    ]);

    TestBed.configureTestingModule({
      providers: [
        RatesDataService,
        { provide: RatesApiService, useValue: apiServiceSpy },
        { provide: SignalRClientService, useValue: signalRServiceSpy },
        { provide: RatesAdapterService, useValue: ratesAdapterServiceSpy },
      ],
    });

    service = TestBed.inject(RatesDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchRates', () => {
    it('should fetch rates from API and update combinedRatesSubject', fakeAsync(() => {
      const baseCurrency = 'USD';
      apiServiceSpy.getRates.and.returnValue(of(mockExchangeRates));
      ratesAdapterServiceSpy.mapRates.and.returnValue(mockMappedRates);

      let result: [CurrencyRate[], Date | null] | undefined;
      service.combinedRates$.subscribe((rates) => {
        result = rates;
      });

      service.fetchRates(baseCurrency);
      tick();

      expect(apiServiceSpy.getRates).toHaveBeenCalledWith(baseCurrency);
      expect(ratesAdapterServiceSpy.mapRates).toHaveBeenCalledWith(
        mockExchangeRates
      );
      expect(result).toEqual(mockMappedRates);
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      const baseCurrency = 'USD';
      const error = new Error('API Error');
      apiServiceSpy.getRates.and.returnValue(throwError(() => error));

      spyOn(console, 'error');

      service.fetchRates(baseCurrency);
      tick();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch rates from API:',
        error
      );
    }));
  });

  describe('real-time rates subscription', () => {
    it('should subscribe to SignalR updates and update combinedRatesSubject', fakeAsync(() => {
      ratesAdapterServiceSpy.mapRates.and.returnValue(mockMappedRates);

      let result: [CurrencyRate[], Date | null] | undefined;
      service.combinedRates$.subscribe((rates) => {
        result = rates;
      });

      signalRSubject.next(mockExchangeRates);
      tick();

      expect(ratesAdapterServiceSpy.mapRates).toHaveBeenCalledWith(
        mockExchangeRates
      );
      expect(result).toEqual(mockMappedRates);
    }));

    it('should filter out null SignalR updates', fakeAsync(() => {
      ratesAdapterServiceSpy.mapRates.and.returnValue(mockMappedRates);

      signalRSubject.next(null);
      tick();

      expect(ratesAdapterServiceSpy.mapRates).not.toHaveBeenCalled();
    }));

    it('should handle SignalR errors gracefully', fakeAsync(() => {
      const error = new Error('SignalR Error');
      ratesAdapterServiceSpy.mapRates.and.throwError(error);

      spyOn(console, 'error');

      signalRSubject.next(mockExchangeRates);
      tick();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch rates from API:',
        error
      );
    }));
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from rates subscription', () => {
      const unsubscribeSpy = spyOn(service['ratesSubscription'], 'unsubscribe');

      service.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
