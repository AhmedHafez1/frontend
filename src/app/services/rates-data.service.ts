import { RatesAdapter as RatesAdapterService } from './rates-adapter.service';
import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { filter, startWith } from 'rxjs/operators';
import { SignalRClientService } from './signal-r-client.service';
import { RatesApiService } from './rates-api-service';
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

    this.ratesSubscription = merge(
      this.apiService.getRates().pipe(startWith(null)),
      this.signalRService.rates$
    )
      .pipe(filter((rates) => Boolean(rates)))
      .subscribe((rates) =>
        this.combinedRatesSubject.next(
          this.ratesAdapterService.mapRates(rates!)
        )
      );
  }

  ngOnDestroy(): void {
    this.ratesSubscription.unsubscribe();
    this.signalRService.stopConnection();
  }
}
