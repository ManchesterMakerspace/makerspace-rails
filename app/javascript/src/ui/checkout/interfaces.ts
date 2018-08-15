import { RequestStatus } from "app/interfaces";

export interface CheckoutState extends RequestStatus {
  clientToken: string;
}