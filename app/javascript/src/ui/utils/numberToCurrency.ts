export const numberAsCurrency = (number: number) => `$${(Math.round(Number(number) * 100) / 100).toFixed(2)}`;
