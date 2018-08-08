import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

import { handleApiError } from "app/utils";

import { AuthState, AuthForm } from "ui/auth/interfaces";
import { postLogin, deleteLogin } from "api/auth/transactions";
import { Action as AuthAction } from "ui/auth/constants";

export const loginUserAction = (
  loginForm?: AuthForm
): ThunkAction<Promise<void>, {}, {}, AnyAction>  => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  let member;
  try {
    const response = await postLogin(loginForm);
    member = response.data;
    dispatch({
      type: AuthAction.LoginUserSuccess,
      data: member
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: AuthAction.LoginUserFailure,
      error: errorMessage
    });
  }
}

// Only used when initializing app
// Used to attempt login from session cookies
export const activeSessionLogin = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  let member;
  try {
    const response = await postLogin();
    member = response.data;
    dispatch({
      type: AuthAction.LoginUserSuccess,
      data: member
    });
  } catch {
    dispatch({ type: AuthAction.LoginUserFailure })
  }
}

export const logoutUserAction = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });
  try {
    await deleteLogin();
  } catch {}
  dispatch({ type: AuthAction.LogoutSuccess });
}

const defaultState: AuthState = {
  currentUser: {
    id: undefined,
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    expirationTime: undefined
  },
  isRequesting: false,
  error: ""
}

export const authReducer = (state: AuthState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case AuthAction.StartAuthRequest:
      return {
        ...state,
        isRequesting: true
      };
    case AuthAction.LoginUserSuccess:
      const { data: newUser } = action;
      return {
        ...state,
        currentUser: newUser,
        isRequesting: false,
        error: ""
      };
    case AuthAction.LoginUserFailure:
      const { error } = action;
      return {
        ...state,
        isRequesting: false,
        error
      }
    case AuthAction.LogoutSuccess:
      return {
        ...defaultState
      }
    default:
      return state;
  }
}