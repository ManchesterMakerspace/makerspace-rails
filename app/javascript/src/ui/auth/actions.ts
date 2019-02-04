import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

import { AuthState, AuthForm, SignUpForm, SignUpPayload } from "ui/auth/interfaces";
import { postLogin, deleteLogin, postSignUp } from "api/auth/transactions";
import { Action as AuthAction } from "ui/auth/constants";
import { Action as CheckoutAction } from "ui/checkout/constants";
import { memberIsAdmin } from "ui/member/utils";

export const loginUserAction = (
  loginForm?: AuthForm
): ThunkAction<Promise<void>, {}, {}, AnyAction>  => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  try {
    const response = await postLogin(loginForm);
    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: response.data.member
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: AuthAction.AuthUserFailure,
      error: errorMessage
    });
  }
}

// Only used when initializing app
// Used to attempt login from session cookies
export const activeSessionLogin = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  try {
    const response = await postLogin();
    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: response.data.member
    });
  } catch {
    dispatch({ type: AuthAction.AuthUserFailure })
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

export const submitSignUpAction = (
  signUpForm: SignUpPayload
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });
  dispatch({ type: CheckoutAction.ResetStagedInvoices });
  try {
    const response = await postSignUp(signUpForm);
    const { member, invoice } = response.data;
    if (invoice) {
      dispatch({
        type: CheckoutAction.StageInvoicesForPayment,
        data: [invoice]
      });
    }

    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: {
        ...member,
        isNewMember: true,
      }
    });
  } catch(e) {
    const { errorMessage } = e;
    dispatch({
      type: AuthAction.AuthUserFailure,
      error: errorMessage
    })
  }
}

const defaultState: AuthState = {
  currentUser: {
    id: undefined,
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    expirationTime: undefined,
    isAdmin: false,
    isNewMember: undefined,
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
    case AuthAction.AuthUserSuccess:
      const { data: newUser } = action;
      return {
        ...state,
        currentUser: {
          ...newUser,
          isAdmin: memberIsAdmin(newUser)
        },
        isRequesting: false,
        error: ""
      };
    case AuthAction.AuthUserFailure:
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