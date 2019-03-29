import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { QueryParams } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

import { getMembers, postMembers } from "api/members/transactions";
import { Action as MembersAction } from "ui/members/constants";
import { MembersState } from "ui/members/interfaces";


export const readMembersAction = (
  queryParams?: QueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembersAction.StartReadRequest });

  try {
    const response = await getMembers(queryParams);
    const {members} = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: MembersAction.GetMembersSuccess,
      data: {
        members,
        totalItems: Number(totalItems)
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


export const createMembersAction = (
  memberForm: MemberDetails
): ThunkAction<Promise<MemberDetails>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembersAction.StartCreateRequest });

  try {
    const response = await postMembers(memberForm);
    const { member: newMember } = response.data;
    dispatch({
      type: MembersAction.CreateMembersSuccess,
    })
    return newMember;
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MembersAction.CreateMembersFailure,
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
  },
  create: {
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
    case MembersAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case MembersAction.CreateMembersSuccess:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case MembersAction.CreateMembersFailure:
      const { error: createError } = action;
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: createError
        }
      }
    default:
      return state;
  }
}