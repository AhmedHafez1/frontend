import { RatesAdapter as RatesAdapterService } from './rates-adapter.service';
import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { SignalRClientService } from './signal-r-client.service';
import { RatesApiService } from './rates-api-service';
import { CurrencyRate } from '../models/currency-rate.model';

@Injectable({
  providedIn: 'root',
})
export class RatesDataService implements OnDestroy {
  private ratesSubscription!: Subscription;
  private combinedRatesSubject = new BehaviorSubject<CurrencyRate[]>([]);

  public combinedRates$ = this.combinedRatesSubject.asObservable();

  constructor(
    private apiService: RatesApiService,
    private signalRService: SignalRClientService,
    private ratesAdapterService: RatesAdapterService
  ) {
    this.subscribeToRealTimeRates();
  }

  ngOnDestroy(): void {
    this.ratesSubscription.unsubscribe();
  }

  public fetchRates(baseCurrency: string): void {
    this.apiService
      .getRates(baseCurrency)
      .pipe(map(this.ratesAdapterService.mapRates))
      .subscribe({
        next: (rates) => this.combinedRatesSubject.next(rates),
        error: (err) => console.error('Failed to fetch rates from API:', err),
      });
  }

  private subscribeToRealTimeRates() {
    this.ratesSubscription = this.signalRService.rates$
      .pipe(filter((rates) => Boolean(rates)))
      .pipe(map(this.ratesAdapterService.mapRates))
      .subscribe({
        next: (rates) => this.combinedRatesSubject.next(rates),
        error: (err) => console.error('Failed to fetch rates from API:', err),
      });
  }
}
