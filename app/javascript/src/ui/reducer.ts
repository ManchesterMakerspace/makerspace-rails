import { combineReducers } from "redux";
import { AuthState } from "./authorization/interfaces";
import { authReducer } from "./authorization/actions";

export interface StateProps {
  auth: AuthState;
}

export const rootReducer = combineReducers({
  auth: authReducer
});
