import { CurrencyRate } from '../models/currency-rate.model';
import { Injectable } from '@angular/core';
import { ExchangeRates } from '../models/exchange-rates.model';
import { ColorCode } from '../models/color-code.enum';

@Injectable({
  providedIn: 'root',
})
export class RatesAdapterService {
  private baseExchangeRates: ExchangeRates | null = null;

  public mapRates(exchangeRates: ExchangeRates | null): [CurrencyRate[], Date] {
    const newCurrencyRates = Object.entries(exchangeRates!.rates).map(
      ([currency, rate]) => {
        const previousRate = this.baseExchangeRates?.rates[currency] ?? rate;
        const percentage = parseFloat(
          (((rate - previousRate) / rate) * 100).toFixed(5)
        );
        return <CurrencyRate>{
          baseCurrency: exchangeRates!.base,
          toCurrency: currency,
          rate,
          percentage,
          color: this.getColorCode(percentage),
        };
      }
    );

    this.baseExchangeRates ??= exchangeRates;

    return [newCurrencyRates, new Date(exchangeRates!.date!)];
  }

  private getColorCode(percentage: number) {
    return percentage > 0
      ? ColorCode.GREEN
      : percentage < 0
      ? ColorCode.RED
      : ColorCode.GRAY;
  }

  public resetBaseExchangeRates() {
    this.baseExchangeRates = null;
  }
}
