import { RequestStatus, CollectionOf } from "app/interfaces";
import { Rental } from "app/entities/rental";

export interface RentalsState {
  entities: CollectionOf<Rental>;
  read: RequestStatus & {
    totalItems: number;
  };
}