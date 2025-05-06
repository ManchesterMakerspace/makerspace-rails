import { Properties } from "app/entities/rental";
import { Rental } from "makerspace-ts-api-client";

export const rentalToRenewal = (rental: Partial<Rental>) => ({
  id: rental[Properties.Id],
  name: `${rental[Properties.Number]}`,
  expiration: rental[Properties.Expiration],
})