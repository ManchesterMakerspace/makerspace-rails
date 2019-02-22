import { Rental, Properties } from "app/entities/rental";

export const rentalToRenewal = (rental: Partial<Rental>) => ({
  id: rental[Properties.Id],
  name: `${rental[Properties.Number]}`,
  expiration: rental[Properties.Expiration],
})