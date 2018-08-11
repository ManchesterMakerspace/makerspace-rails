import { MemberDetails, Properties as MemberProperties } from "app/entities/member";

export interface AuthState {
  currentUser: AuthMember;
  isRequesting: boolean;
  error: string;
}

export interface AuthForm {
  email: string;
  password: string;
}

type AuthMember = Pick<MemberDetails,
                        MemberProperties.Id |
                        MemberProperties.Email |
                        MemberProperties.Lastname |
                        MemberProperties.Firstname |
                        MemberProperties.Expiration
                      >;