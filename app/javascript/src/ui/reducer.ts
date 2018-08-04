import { combineReducers } from "redux";
import { AuthState } from "ui/auth/interfaces";
import { authReducer } from "ui/auth/actions";

export interface StateProps {
  auth: AuthState;
}

export const rootReducer = combineReducers({
  auth: authReducer
});
