export const numberAsCurrency = (number: number | string) => `$${(Math.round(Number(number) * 100) / 100).toFixed(2)}`;
