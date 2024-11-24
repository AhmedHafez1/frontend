import { TestBed } from '@angular/core/testing';
import { RatesAdapterService } from './rates-adapter.service';
import { ExchangeRates } from '../models/exchange-rates.model';
import { ColorCode } from '../models/color-code.enum';

describe('RatesAdapterService', () => {
  let service: RatesAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatesAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map rates and calculate percentage difference correctly', () => {
    const exchangeRates: ExchangeRates = {
      base: 'USD',
      rates: {
        EUR: 1.2,
        GBP: 0.8,
      },
      date: '2024-11-24',
    };

    // Base exchange rates should be null initially
    service.resetBaseExchangeRates();
    const [currencyRates, lastUpdatedDate] = service.mapRates(exchangeRates);

    // Check the output array structure
    expect(currencyRates).toEqual([
      {
        baseCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 1.2,
        percentage: 0, // since there is no previous rate, it should be 0
        color: ColorCode.GRAY,
      },
      {
        baseCurrency: 'USD',
        toCurrency: 'GBP',
        rate: 0.8,
        percentage: 0, // since there is no previous rate, it should be 0
        color: ColorCode.GRAY,
      },
    ]);
    expect(lastUpdatedDate).toBeInstanceOf(Date);
    expect(lastUpdatedDate.toISOString()).toBe('2024-11-24T00:00:00.000Z');
  });

  it('should calculate percentage change correctly when base rates are set', () => {
    const initialExchangeRates: ExchangeRates = {
      base: 'USD',
      rates: {
        EUR: 1.2,
        GBP: 0.8,
      },
      date: '2024-11-24',
    };

    // Map initial rates
    service.mapRates(initialExchangeRates);

    // New exchange rates for the same base currency
    const updatedExchangeRates: ExchangeRates = {
      base: 'USD',
      rates: {
        EUR: 1.3, // Increased from 1.2 to 1.3
        GBP: 0.75, // Decreased from 0.8 to 0.75
      },
      date: '2024-11-25',
    };

    const [currencyRates, lastUpdatedDate] =
      service.mapRates(updatedExchangeRates);

    // Validate the calculated percentage change and color
    expect(currencyRates).toEqual([
      {
        baseCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 1.3,
        percentage: 7.69231, // (1.3 - 1.2) / 1.3 * 100
        color: ColorCode.GREEN,
      },
      {
        baseCurrency: 'USD',
        toCurrency: 'GBP',
        rate: 0.75,
        percentage: -6.66667, // (0.75 - 0.8) / 0.75 * 100
        color: ColorCode.RED,
      },
    ]);
    expect(lastUpdatedDate).toBeInstanceOf(Date);
    expect(lastUpdatedDate.toISOString()).toBe('2024-11-25T00:00:00.000Z');
  });

  it('should reset base exchange rates when resetBaseExchangeRates is called', () => {
    const exchangeRates: ExchangeRates = {
      base: 'USD',
      rates: {
        EUR: 1.2,
        GBP: 0.8,
      },
      date: '2024-11-24',
    };

    service.mapRates(exchangeRates); // Set base rates
    service.resetBaseExchangeRates(); // Reset the base rates

    // Call mapRates again, base should now be null, so percentage should be 0 again
    const [currencyRates] = service.mapRates(exchangeRates);

    expect(currencyRates).toEqual([
      {
        baseCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 1.2,
        percentage: 0, // Since base rates were reset, it should be 0
        color: ColorCode.GRAY,
      },
      {
        baseCurrency: 'USD',
        toCurrency: 'GBP',
        rate: 0.8,
        percentage: 0, // Same for GBP
        color: ColorCode.GRAY,
      },
    ]);
  });
});
