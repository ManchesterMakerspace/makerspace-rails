import { AnyAction } from "redux";
import { AuthState } from "./interfaces";

const defaultState: AuthState = {
  email: ""
}

export const authReducer = (state: AuthState = defaultState, action: AnyAction) => {
  switch (action.type) {
    default: 
      return state;
  }
}