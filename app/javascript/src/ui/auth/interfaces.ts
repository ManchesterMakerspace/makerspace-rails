import { MemberDetails, Properties as MemberProperties } from "app/entities/member";
import { BillingPlan } from "app/entities/billingPlan";
export interface AuthState {
  currentUser: AuthMember;
  isRequesting: boolean;
  error: string;
}

export interface AuthForm {
  email: string;
  password: string;
}

export interface MemberSignUpForm {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface SignUpForm extends MemberSignUpForm {
  membershipId: string;
  discount: boolean;
}

export type AuthMember = Pick<MemberDetails,
                        MemberProperties.Id |
                        MemberProperties.Email |
                        MemberProperties.Lastname |
                        MemberProperties.Firstname |
                        MemberProperties.Expiration |
                        MemberProperties.Role
                      > & Partial<MemberDetails> & {
  isAdmin: boolean;
  isNewMember: boolean;
};

type NewUserSignUp = Pick<MemberDetails,
                          MemberProperties.Email |
                          MemberProperties.Lastname |
                          MemberProperties.Firstname> & {
  password: string;
  planId?: string;
  paymentMethod?: string;
  paymentMethodNonce?: string;
}