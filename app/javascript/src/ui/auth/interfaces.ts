import { MemberDetails } from "ui/member/interfaces";

export interface AuthState {
  currentUser: MemberDetails;
  isRequesting: boolean;
  error: string;
}

export interface AuthForm {
  email?: string;
  password?: string;
}