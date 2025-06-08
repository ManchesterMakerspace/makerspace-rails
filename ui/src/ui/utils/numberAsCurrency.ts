export const numberAsCurrency = (value: number | string): string => `$${(Math.round(Number(value) * 100) / 100).toFixed(2)}`;
