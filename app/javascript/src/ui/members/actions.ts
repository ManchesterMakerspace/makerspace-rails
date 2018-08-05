import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { getMembers } from "api/members/transactions";
import { Action as MembersAction } from "ui/members/constants";
import { handleApiError } from "app/utils";
import { MembersState } from "ui/members/interfaces";

export const readMembersAction = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembersAction.StartReadRequest });

  let member;
  try {
    const response = await getMembers();
    member = response.data;
    dispatch({
      type: MembersAction.GetMembersSuccess,
      data: member
    });
  } catch (e) {
    const error = handleApiError(e);
    dispatch({
      type: MembersAction.GetMembersFailure,
      error
    });
  }
};

const defaultState: MembersState = {
  entities: {},
  read: {
    isRequesting: false,
    error: ""
  }
}

export const membersReducer = (state: MembersState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case MembersAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case MembersAction.GetMembersSuccess:
      const { data: members } = action;
      const newMembers = {};
      members.forEach((member) => {
        newMembers[member.id] = member;
      });

      return {
        ...state,
        entities: {
          ...state.entities,
          ...newMembers
        },
        read: {
          ...state.read,
          isRequesting: false,
          error: ""
        }
      };
    case MembersAction.GetMembersFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    default: 
      return state;
  }
}