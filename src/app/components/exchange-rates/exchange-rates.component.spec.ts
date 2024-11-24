import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExchangeRatesComponent } from './exchange-rates.component';
import { RatesDataService } from '../../services/rates-data.service';
import { SignalRClientService } from '../../services/signal-r-client.service';
import { RatesAdapterService } from './../../services/rates-adapter.service';
import { of } from 'rxjs';
import { Currencies } from '../../constants/currency.constants';
import { CurrencyRate } from '../../models/currency-rate.model';
import { ColorCode } from '../../models/color-code.enum';

describe('ExchangeRatesComponent', () => {
  let component: ExchangeRatesComponent;
  let fixture: ComponentFixture<ExchangeRatesComponent>;
  let ratesDataServiceMock: jasmine.SpyObj<RatesDataService>;
  let signalRClientServiceMock: jasmine.SpyObj<SignalRClientService>;
  let ratesAdapterServiceMock: jasmine.SpyObj<RatesAdapterService>;

  beforeEach(async () => {
    const ratesDataServiceSpy = jasmine.createSpyObj('RatesDataService', [
      'fetchRates',
      'combinedRates$',
    ]);
    const signalRClientServiceSpy = jasmine.createSpyObj(
      'SignalRClientService',
      ['subscribeToBaseCurrency']
    );
    const ratesAdapterServiceSpy = jasmine.createSpyObj('RatesAdapterService', [
      'resetBaseExchangeRates',
    ]);

    // Mock combinedRates$ to return an observable
    ratesDataServiceSpy.combinedRates$ = of([[], '2024-11-24']); // Initial mock data

    await TestBed.configureTestingModule({
      declarations: [ExchangeRatesComponent],
      providers: [
        { provide: RatesDataService, useValue: ratesDataServiceSpy },
        { provide: SignalRClientService, useValue: signalRClientServiceSpy },
        { provide: RatesAdapterService, useValue: ratesAdapterServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExchangeRatesComponent);
    component = fixture.componentInstance;

    ratesDataServiceMock = TestBed.inject(
      RatesDataService
    ) as jasmine.SpyObj<RatesDataService>;
    signalRClientServiceMock = TestBed.inject(
      SignalRClientService
    ) as jasmine.SpyObj<SignalRClientService>;
    ratesAdapterServiceMock = TestBed.inject(
      RatesAdapterService
    ) as jasmine.SpyObj<RatesAdapterService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with selectedCurrency as USD', () => {
    expect(component.selectedCurrency).toBe('USD');
  });

  it('should call fetchRates on RatesDataService with selectedCurrency', () => {
    expect(ratesDataServiceMock.fetchRates).toHaveBeenCalledWith('USD');
  });

  it('should call subscribeToBaseCurrency and fetchRates when onBaseCurrencyChange is called', () => {
    const newCurrency = 'EUR';
    component.onBaseCurrencyChange(newCurrency);

    expect(
      signalRClientServiceMock.subscribeToBaseCurrency
    ).toHaveBeenCalledWith(newCurrency);
    expect(ratesDataServiceMock.fetchRates).toHaveBeenCalledWith(newCurrency);
    expect(ratesAdapterServiceMock.resetBaseExchangeRates).toHaveBeenCalled();
    expect(component.selectedCurrency).toBe(newCurrency);
  });

  it('should have correct default displayedColumns', () => {
    expect(component.displayedColumns).toEqual([
      'baseCurrency',
      'toCurrency',
      'rate',
      'percentage',
    ]);
  });

  it('should have a list of base currencies from Currencies constant', () => {
    expect(component.baseCurrencyList).toBe(Currencies);
  });
});
