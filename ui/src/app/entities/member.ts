import { Member } from "makerspace-ts-api-client";

export enum Properties {
  Id = "id",
  Firstname = "firstname",
  Lastname = "lastname",
  Email = "email",
  Expiration = "expirationTime",
  Status = "status",
  Role = "role",
}

export const isMember = (entity: any): entity is Member => entity.hasOwnProperty(Properties.Expiration) && entity.hasOwnProperty(Properties.Firstname);
