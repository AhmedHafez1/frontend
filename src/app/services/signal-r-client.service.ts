import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { ExchangeRates } from '../models/exchange-rates.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRClientService implements OnDestroy {
  private readonly wsUrl = environment.signalRUrl + 'ws/rates';
  private readonly maxRetries = 5;
  private retryCount = 0;
  private hubConnection: signalR.HubConnection | null = null;
  private ratesSubject = new BehaviorSubject<ExchangeRates | null>(null);
  private selectedCurrency = 'USD';

  rates$ = this.ratesSubject.asObservable();

  constructor() {
    this.startConnection();
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }

  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.wsUrl)
      .withAutomaticReconnect()
      .build();

    this.start();

    this.hubConnection.on('ConnectionEstablished', () => {
      console.log('Connection Established');
    });
  }

  async start(): Promise<void> {
    try {
      await this.hubConnection?.start();
      console.log('SignalR Connected!');
      this.subscribeToBaseCurrency(this.selectedCurrency);
      this.retryCount = 0;
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.start(), 5000);
      } else {
        console.error('Max retry attempts reached. Connection failed.');
      }
    }
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => {
        console.log('SignalR Connection Stopped.');
      });
      this.hubConnection.off(this.selectedCurrency);
    }
  }

  joinCurrencyGroup(currency: string): void {
    this.hubConnection
      ?.invoke('JoinGroup', currency)
      .then(() => console.log(`Joined group for ${currency}`))
      .catch((err) =>
        console.error(`Failed to join group for ${currency}: `, err)
      );
  }

  leaveCurrencyGroup(currency: string): void {
    this.hubConnection
      ?.invoke('LeaveGroup', currency)
      .then(() => console.log(`Left group for ${currency}`))
      .catch((err) =>
        console.error(`Failed to leave group for ${currency}: `, err)
      );
  }

  subscribeToBaseCurrency(newCurrency: string): void {
    if (this.selectedCurrency) {
      // Unsubscribe from the old currency group
      this.leaveCurrencyGroup(this.selectedCurrency);
    }

    // Update the current selected currency
    this.selectedCurrency = newCurrency;

    // Subscribe to the new currency group
    this.joinCurrencyGroup(newCurrency);

    // Update event listeners for the new currency
    this.updateCurrencyListener();
  }

  private updateCurrencyListener(): void {
    if (this.hubConnection) {
      this.hubConnection.off(this.selectedCurrency);

      this.hubConnection.on(this.selectedCurrency, (rates: ExchangeRates) => {
        this.ratesSubject.next(rates);
      });
    }
  }
}
