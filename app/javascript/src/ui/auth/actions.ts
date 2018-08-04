import { AnyAction } from "redux";
import { AuthState, AuthForm } from "ui/auth/interfaces";
import { postLogin } from "api/auth/transactions";
import { Action as AuthAction } from "ui/auth/constants";
import { ThunkAction } from "redux-thunk";
import { MemberDetails } from "ui/member/interfaces";

export const loginUserAction = (
  loginForm: AuthForm
): ThunkAction<Promise<MemberDetails>, {}, {}, AnyAction> => async (dispatch) => {
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
    dispatch({
      type: AuthAction.LoginUserFailure,
      error: e
    });
  }
  return member;
}

const defaultState: AuthState = {
  member: {
    firstname: undefined,
    lastname: undefined,
    email: undefined,
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
        member: newUser,
        isRequesting: false,
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