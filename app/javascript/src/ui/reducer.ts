import { combineReducers, Action } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { AuthState } from "ui/auth/interfaces";
import { authReducer } from "ui/auth/actions";
import { membersReducer } from "ui/members/actions";
import { MembersState } from "ui/members/interfaces";
import { RentalsState } from "ui/rentals/interfaces";
import { PlansState } from "ui/billing/interfaces";
import { rentalsReducer } from "ui/rentals/actions";
import { plansReducer } from "ui/billing/actions";
import { MemberState } from "ui/member/interfaces";
import { memberReducer } from "ui/member/actions";

export type ScopedThunkDispatch = ThunkDispatch<State, {}, Action>

export interface State {
  auth: AuthState;
  members: MembersState;
  member: MemberState;
  rentals: RentalsState;
  plans: PlansState;
}

export const rootReducer = combineReducers({
  auth: authReducer,
  members: membersReducer,
  member: memberReducer,
  rentals: rentalsReducer,
  plans: plansReducer
});
