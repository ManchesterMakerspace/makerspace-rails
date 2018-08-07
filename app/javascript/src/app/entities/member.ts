export interface MemberDetails {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  expirationTime: number;
  status: MemberStatus;
}

export enum Properties {
  Id = "id",
  Firstname = "firstname",
  Lastname = "lastname",
  Email = "email",
  Expiration = "expirationTime",
  Status = "status"
}

export enum MemberStatus {
  Active = "activeMember",
  Revoked = "revoked",
  NonMember = "nonMember"
}