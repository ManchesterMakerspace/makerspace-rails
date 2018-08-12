import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { getMember, updateMember } from "api/member/transactions";
import { Action as MemberAction } from "ui/member/constants";
import { MemberState } from "ui/member/interfaces";
import { MemberDetails } from "app/entities/member";
import RenewalForm from "ui/common/RenewalForm";

export const readMemberAction = (
  memberId: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MemberAction.StartReadRequest });

  try {
    const response = await getMember(memberId);
    const { data } = response;
    dispatch({
      type: MemberAction.GetMemberSuccess,
      data
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
  updateDetails: Partial<MemberDetails>
): ThunkAction<Promise<void>, {}, {}, AnyAction > => async (dispatch) => {
  dispatch({ type: MemberAction.StartUpdateRequest });

  try {
    const response = await updateMember(memberId, updateDetails);
    const { data } = response;
    dispatch({
      type: MemberAction.UpdateMemberSuccess,
      data
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