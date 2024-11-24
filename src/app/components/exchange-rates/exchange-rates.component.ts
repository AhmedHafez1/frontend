import { SignalRClientService } from './../../services/signal-r-client.service';
import { Component } from '@angular/core';
import { RatesDataService } from '../../services/rates-data.service';
import { Currencies } from '../../constants/currency.constants';

@Component({
  selector: 'app-exchange-rates',
  templateUrl: './exchange-rates.component.html',
  styleUrl: './exchange-rates.component.scss',
})
export class ExchangeRatesComponent {
  public selectedBaseCurrency = 'USD';
  public displayedColumns: string[] = [
    'baseCurrency',
    'toCurrency',
    'rate',
    'percentage',
  ];
  public baseCurrencyList = Currencies;

  public rates$ = this.ratesDataService.combinedRates$;

  constructor(
    private ratesDataService: RatesDataService,
    private signalRClientService: SignalRClientService
  ) {}

  onBaseCurrencyChange(selectedCurrency: string): void {
    this.signalRClientService.subscribeToBaseCurrency(selectedCurrency);
    this.selectedBaseCurrency = selectedCurrency;
  }
}
