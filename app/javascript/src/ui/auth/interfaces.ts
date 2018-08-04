import { MemberDetails } from "ui/member/interfaces";

export interface AuthState {
  member: MemberDetails;
  isRequesting: boolean;
  error: string;
}

export interface AuthForm {
  email?: string;
  password?: string;
}