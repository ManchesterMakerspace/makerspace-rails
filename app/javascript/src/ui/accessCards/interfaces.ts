import { RequestStatus } from "app/interfaces";
import { AccessCard } from "app/entities/card";

export interface CardState {
  entity: AccessCard;
  read: RequestStatus;
  update: RequestStatus;
}