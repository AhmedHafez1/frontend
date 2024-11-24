import { RatesAdapterService } from './../../services/rates-adapter.service';
import { SignalRClientService } from './../../services/signal-r-client.service';
import { Component } from '@angular/core';
import { RatesDataService } from '../../services/rates-data.service';
import { Currencies } from '../../constants/currency.constants';
import { map } from 'rxjs';

@Component({
  selector: 'app-exchange-rates',
  templateUrl: './exchange-rates.component.html',
  styleUrl: './exchange-rates.component.scss',
})
export class ExchangeRatesComponent {
  public selectedCurrency = 'USD';
  public displayedColumns: string[] = [
    'baseCurrency',
    'toCurrency',
    'rate',
    'percentage',
  ];
  public baseCurrencyList = Currencies;

  public rates$ = this.ratesDataService.combinedRates$.pipe(
    map(([rates, _]) => rates)
  );

  lastUpdatedDate$ = this.ratesDataService.combinedRates$.pipe(
    map(([_, date]) => date)
  );

  constructor(
    private ratesDataService: RatesDataService,
    private signalRClientService: SignalRClientService,
    private ratesAdapter: RatesAdapterService
  ) {
    ratesDataService.fetchRates(this.selectedCurrency);
  }

  onBaseCurrencyChange(selectedCurrency: string): void {
    this.signalRClientService.subscribeToBaseCurrency(selectedCurrency);
    this.ratesDataService.fetchRates(selectedCurrency);
    this.ratesAdapter.resetBaseExchangeRates();
    this.selectedCurrency = selectedCurrency;
  }
}
