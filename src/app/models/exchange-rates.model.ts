export interface ExchangeRates {
  base: string;
  date: string;
  rates: { [key: string]: number };
}
