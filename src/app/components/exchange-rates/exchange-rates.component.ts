import { Component } from '@angular/core';
import { RatesDataService } from '../../services/rates-data.service';

@Component({
  selector: 'app-exchange-rates',
  templateUrl: './exchange-rates.component.html',
  styleUrl: './exchange-rates.component.scss',
})
export class ExchangeRatesComponent {
  public displayedColumns: string[] = [
    'baseCurrency',
    'toCurrency',
    'rate',
    'percentage',
  ];
  public rates$ = this.ratesDataService.combinedRates$;

  constructor(private ratesDataService: RatesDataService) {}
}
