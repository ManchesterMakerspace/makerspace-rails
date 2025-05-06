import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { AuthState, AuthForm, SignUpForm, AuthMember } from "ui/auth/interfaces";
import { Action as AuthAction } from "ui/auth/constants";
import { TransactionAction } from "ui/reducer";
import { memberIsAdmin } from "ui/member/utils";
import {
  signIn,
  listMembersPermissions,
  Member,
  signOut,
  registerMember,
  isApiErrorResponse,
  ApiErrorResponse,
  ApiDataResponse
} from "makerspace-ts-api-client";
import { CartAction } from "../checkout/cart";

const handleAuthWithPermissions = async (
  response: ApiErrorResponse | ApiDataResponse<Member>,
  dispatch: ThunkDispatch<{}, {}, AnyAction>,
  ignoreError: boolean = false
) => {
  if (isApiErrorResponse(response)) {
    dispatch({
      type: AuthAction.AuthUserFailure,
      error: ignoreError ? undefined : response.error.message
    });
  } else {
    const member = response.data;
    const permissionsResponse = await listMembersPermissions({ id: member.id });

    if (isApiErrorResponse(permissionsResponse)) {
      dispatch({
        type: AuthAction.AuthUserFailure,
        error: permissionsResponse.error.message
      });
    } else {
      const permissions = permissionsResponse.data;

      dispatch({
        type: AuthAction.AuthUserSuccess,
        data: {
          member,
          permissions
        }
      });
    }
  }
}

export const loginUserAction = (
  loginForm?: AuthForm
): ThunkAction<Promise<void>, {}, {}, AnyAction>  => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  const response = await signIn({ body: { member: loginForm } });
  await handleAuthWithPermissions(response, dispatch);
}

export const sessionLoginUserAction = (): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  const response = await signIn({ body: {}});
  await handleAuthWithPermissions(response, dispatch, true);
}

export const refreshUserAction = sessionLoginUserAction;

export const logoutUserAction = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });
  await signOut();
  dispatch({ type: TransactionAction.Reset });
  dispatch({ type: CartAction.EmptyCart });
  dispatch({ type: AuthAction.LogoutSuccess });
}

export const submitSignUpAction = (
  signUpForm: SignUpForm
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  const response = await registerMember({ body: signUpForm });
  await handleAuthWithPermissions(response, dispatch);
}

const defaultState: AuthState = {
  currentUser: {
    id: undefined,
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    expirationTime: undefined,
    isAdmin: false,
  } as AuthMember,
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