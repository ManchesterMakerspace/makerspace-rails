import { AnyAction } from "redux";
import { AuthState } from "ui/auth/interfaces";
import { postLogin } from "api/auth/transactions";

export const loginUserAction = async (loginForm = {}) => {
  await postLogin(loginForm);
}

const defaultState: AuthState = {
  email: ""
}

export const authReducer = (state: AuthState = defaultState, action: AnyAction) => {
  switch (action.type) {
    default: 
      return state;
  }
}