import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { ExchangeRates } from '../models/exchange-rates.model';

@Injectable({
  providedIn: 'root',
})
export class SignalRClientService {
  private hubConnection: signalR.HubConnection | null = null;
  private ratesSubject = new BehaviorSubject<ExchangeRates | null>(null);

  rates$ = this.ratesSubject.asObservable();

  constructor() {}

  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/ws/rates')
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connection Established'))
      .catch((err) => console.error('SignalR Connection Error:', err));

    this.hubConnection.on('ReceiveRates', (rates: ExchangeRates) => {
      this.ratesSubject.next(rates);
    });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
