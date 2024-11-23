import { CurrencyRate } from '../models/currency-rate.model';
import { Injectable } from '@angular/core';
import { ExchangeRates } from '../models/exchange-rates.model';
import { ColorCode } from '../models/color-code.enum';

@Injectable({
  providedIn: 'root',
})
export class RatesAdapter {
  public baseExchangeRates: ExchangeRates | null = null;

  public mapRates(exchangeRates: ExchangeRates): CurrencyRate[] {
    const newCurrencyRates = Object.entries(exchangeRates.rates).map(
      ([currency, rate]) => {
        const previousRate = this.baseExchangeRates?.rates[currency] ?? rate;
        return <CurrencyRate>{
          baseCurrency: exchangeRates.base,
          toCurrency: currency,
          rate,
          percentage: ((rate - previousRate) / rate) * 100,
          color: this.getColorCode(rate - previousRate),
        };
      }
    );

    this.baseExchangeRates ??= exchangeRates;

    return newCurrencyRates;
  }

  private getColorCode(change: number) {
    return change > 0
      ? ColorCode.GREEN
      : change < 0
      ? ColorCode.RED
      : ColorCode.GRAY;
  }
}
