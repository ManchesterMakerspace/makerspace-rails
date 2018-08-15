import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";

import { getMembers } from "api/members/transactions";
import { Action as MembersAction } from "ui/members/constants";
import { MembersState } from "ui/members/interfaces";
import { QueryParams } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

export const readMembersAction = (
  queryParams?: QueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembersAction.StartReadRequest });

  try {
    const response = await getMembers(queryParams);
    const members = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: MembersAction.GetMembersSuccess,
      data: {
        members,
        totalItems: toNumber(totalItems)
      }
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MembersAction.GetMembersFailure,
      error: errorMessage
    });
  }
};

const defaultState: MembersState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
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
      const {
        data: {
          members,
          totalItems,
        }
      } = action;

      const newMembers = {};
      members.forEach((member: MemberDetails) => {
        newMembers[member.id] = member;
      });

      return {
        ...state,
        entities: newMembers,
        read: {
          ...state.read,
          totalItems,
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