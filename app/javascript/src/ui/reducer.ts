import { combineReducers } from "redux";
import { AuthState } from "ui/auth/interfaces";
import { authReducer } from "ui/auth/actions";
import { membersReducer } from "ui/members/actions";
import { MembersState } from "ui/members/interfaces";

export interface StateProps {
  auth: AuthState;
  members: MembersState;
}

export const rootReducer = combineReducers({
  auth: authReducer,
  members: membersReducer
});
