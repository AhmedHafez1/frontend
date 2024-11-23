import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { ExchangeRates } from '../models/exchange-rates.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRClientService {
  private readonly wsUrl = environment.apiUrl + 'ws/rates';
  private hubConnection: signalR.HubConnection | null = null;
  private ratesSubject = new BehaviorSubject<ExchangeRates | null>(null);

  rates$ = this.ratesSubject.asObservable();

  constructor() {}

  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.wsUrl)
      .withAutomaticReconnect()
      .build();

    this.start();

    this.hubConnection.on('ReceiveRates', (rates: ExchangeRates) => {
      this.ratesSubject.next(rates);
    });
  }

  async start() {
    try {
      await this.hubConnection?.start();
      console.log('SignalR Connected!');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      setTimeout(() => this.start(), 5000);
    }
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
