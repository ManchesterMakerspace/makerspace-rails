import { RequestStatus, CollectionOf } from "app/interfaces";
import { Transaction } from "app/entities/transaction";

export interface TransactionsState {
  entities: CollectionOf<Transaction>;
  read: RequestStatus & {
    totalItems: number;
  };
  delete: RequestStatus;
}