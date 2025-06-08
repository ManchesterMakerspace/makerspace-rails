import { Member } from "makerspace-ts-api-client";
import { Permission } from "app/entities/permission";
import { CollectionOf } from "app/interfaces";

export interface AuthState {
  currentUser: AuthMember;
  permissions: CollectionOf<Permission>;
  isRequesting: boolean;
  error: string;
}

export interface AuthForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  address: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    postalCode: string;
  }
}

export type AuthMember = Member & {
  isAdmin: boolean;
};
