import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExchangeRates } from '../models/exchange-rates.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RatesApiService {
  private readonly apiUrl = environment.apiUrl + 'api/currency';

  constructor(private http: HttpClient) {}

  getRates(baseCurrency = 'USD'): Observable<ExchangeRates> {
    const params = new HttpParams().append('base', baseCurrency);
    return this.http.get<ExchangeRates>(this.apiUrl, { params });
  }
}
