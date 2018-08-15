import { combineReducers, Action } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { AuthState } from "ui/auth/interfaces";
import { authReducer } from "ui/auth/actions";
import { membersReducer } from "ui/members/actions";
import { MembersState } from "ui/members/interfaces";
import { RentalsState } from "ui/rentals/interfaces";
import { rentalsReducer } from "ui/rentals/actions";
import { PlansState } from "ui/billingPlans/interfaces";
import { plansReducer } from "ui/billingPlans/actions";
import { SubscriptionsState } from "ui/subscriptions/interfaces";
import { subscriptionsReducer } from "ui/subscriptions/actions";
import { MemberState } from "ui/member/interfaces";
import { memberReducer } from "ui/member/actions";
import { CheckoutState } from "ui/checkout/interfaces";
import { checkoutReducer } from "ui/checkout/actions";

export type ScopedThunkDispatch = ThunkDispatch<State, {}, Action>

export interface State {
  auth: AuthState;
  members: MembersState;
  member: MemberState;
  rentals: RentalsState;
  plans: PlansState;
  subscriptions: SubscriptionsState;
  checkout: CheckoutState;
}

export const rootReducer = combineReducers({
  auth: authReducer,
  members: membersReducer,
  member: memberReducer,
  rentals: rentalsReducer,
  plans: plansReducer,
  subscriptions: subscriptionsReducer,
  checkout: checkoutReducer
});
