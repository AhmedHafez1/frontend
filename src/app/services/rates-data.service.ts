import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SignalRClientService } from './signal-r-client.service';
import { RatesApiService } from './rates-api-service';
import { ExchangeRates } from '../models/exchange-rates.model';

@Injectable({
  providedIn: 'root',
})
export class RatesDataService implements OnDestroy {
  private ratesSubscription: Subscription;
  private combinedRatesSubject = new BehaviorSubject<ExchangeRates | null>(
    null
  );

  public combinedRates$ = this.combinedRatesSubject.asObservable();

  constructor(
    private apiService: RatesApiService,
    private signalRService: SignalRClientService
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
      .subscribe((rates) => this.combinedRatesSubject.next(rates));
  }

  ngOnDestroy(): void {
    this.ratesSubscription.unsubscribe();
    this.signalRService.stopConnection();
  }
}
