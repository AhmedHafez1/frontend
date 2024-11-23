import { RatesAdapter as RatesAdapterService } from './rates-adapter.service';
import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SignalRClientService } from './signal-r-client.service';
import { RatesApiService } from './rates-api-service';
import { ExchangeRates } from '../models/exchange-rates.model';
import { CurrencyRate } from '../models/currency-rate.model';

@Injectable({
  providedIn: 'root',
})
export class RatesDataService implements OnDestroy {
  private ratesSubscription: Subscription;
  private combinedRatesSubject = new BehaviorSubject<CurrencyRate[]>([]);

  public combinedRates$ = this.combinedRatesSubject.asObservable();

  constructor(
    private apiService: RatesApiService,
    private signalRService: SignalRClientService,
    private ratesAdapterService: RatesAdapterService
  ) {
    this.signalRService.startConnection();

    // Combine REST API and SignalR updates
    this.ratesSubscription = combineLatest([
      this.apiService.getRates().pipe(startWith(null)),
      this.signalRService.rates$,
    ])
      .pipe(
        map(([apiRates, signalRRates]) => {
          // Merge API rates with SignalR updates
          return signalRRates?.rates ? signalRRates : apiRates;
        })
      )
      .subscribe((rates) =>
        this.combinedRatesSubject.next(ratesAdapterService.mapRates(rates!))
      );
  }

  ngOnDestroy(): void {
    this.ratesSubscription.unsubscribe();
    this.signalRService.stopConnection();
  }
}
