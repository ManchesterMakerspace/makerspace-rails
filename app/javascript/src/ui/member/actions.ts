import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { getMember, putMember } from "api/members/transactions";
import { Action as MemberAction } from "ui/member/constants";
import { MemberState } from "ui/member/interfaces";
import { MemberDetails } from "app/entities/member";

export const readMemberAction = (
  memberId: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MemberAction.StartReadRequest });

  try {
    const response = await getMember(memberId);
    const { data } = response;
    dispatch({
      type: MemberAction.GetMemberSuccess,
      data: data.member
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MemberAction.GetMemberFailure,
      error: errorMessage
    });
  }
};

export const updateMemberAction = (
  memberId: string,
  updateDetails: Partial<MemberDetails>,
  isAdmin: boolean = false
): ThunkAction<Promise<void>, {}, {}, AnyAction > => async (dispatch) => {
  dispatch({ type: MemberAction.StartUpdateRequest });

  try {
    const response = await putMember(memberId, updateDetails, isAdmin);
    const { data } = response;
    dispatch({
      type: MemberAction.UpdateMemberSuccess,
      data: data.member
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MemberAction.UpdateMemberFailure,
      error: errorMessage
    });
  }
}

const defaultState: MemberState = {
  entity: undefined,
  read: {
    isRequesting: false,
    error: "",
  },
  update: {
    isRequesting: false,
    error: "",
  }
}

export const memberReducer = (state: MemberState = defaultState, action: AnyAction) => {
  let error;

  switch (action.type) {
    case MemberAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case MemberAction.GetMemberSuccess:
      const { data: member } = action;

      return {
        ...state,
        entity: member,
        read: {
          ...state.read,
          isRequesting: false,
          error: ""
        }
      };
    case MemberAction.GetMemberFailure:
      error = action.error;

      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case MemberAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      };
    case MemberAction.UpdateMemberSuccess:
      const { data: updatedMemebr } = action;

      return {
        ...state,
        entity: updatedMemebr,
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      };
    case MemberAction.UpdateMemberFailure:
      error = action.error;

      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error
        }
      }
    default:
      return state;
  }
}