import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

import { AuthState, AuthForm, SignUpForm } from "ui/auth/interfaces";
import { postLogin, deleteLogin, postSignUp } from "api/auth/transactions";
import { Action as AuthAction } from "ui/auth/constants";
import { Action as CheckoutAction } from "ui/checkout/constants";
import { memberIsAdmin } from "ui/member/utils";
import { getPermissionsForMember } from "api/permissions/transactions";

export const loginUserAction = (
  loginForm?: AuthForm
): ThunkAction<Promise<void>, {}, {}, AnyAction>  => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  try {
    const response = await postLogin(loginForm);
    const { member } = response.data;
    const permissionsResponse = await getPermissionsForMember(member.id);
    const { permissions } = permissionsResponse.data;

    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: {
        member,
        permissions
      }
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
    const { member } = response.data;
    const permissionsResponse = await getPermissionsForMember(member.id);
    const { permissions } = permissionsResponse.data;

    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: {
        member,
        permissions
      }
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
    // TODO Reset stores
  } catch {}
  dispatch({ type: AuthAction.LogoutSuccess });
}

export const submitSignUpAction = (
  signUpForm: SignUpForm
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });
  dispatch({ type: CheckoutAction.ResetStagedInvoices });
  try {
    const response = await postSignUp(signUpForm);
    const { member } = response.data;

    const permissionsResponse = await getPermissionsForMember(member.id);
    const { permissions } = permissionsResponse.data;

    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: {
        member: {
          ...member,
          isNewMember: true,
        },
        permissions,
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
  permissions: {},
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
      const { data: {
        member,
        permissions
      } } = action;
      return {
        ...state,
        currentUser: {
          ...member,
          isAdmin: memberIsAdmin(member)
        },
        permissions,
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