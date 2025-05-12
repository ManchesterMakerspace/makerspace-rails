import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import omit from "lodash-es/omit";

import { QueryParams } from "app/interfaces";

import { Action as MembershipAction } from "ui/earnedMemberships/constants";
import { EarnedMembershipsState } from "ui/earnedMemberships/interfaces";
import {
  NewEarnedMembership,
  EarnedMembership,
  adminListEarnedMemberships,
  isApiErrorResponse,
  adminGetEarnedMembership,
  getEarnedMembership,
  adminCreateEarnedMembership,
  adminUpdateEarnedMembership
} from "makerspace-ts-api-client";


export const readMembershipsAction = (
  queryParams?: QueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartReadRequest });


  const result = await adminListEarnedMemberships(queryParams);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: MembershipAction.GetMembershipsFailure,
      error: result.error.message
    });
  } else {
    const { response, data } = result;
    const totalItems = response.headers.get("total-items");
    dispatch({
      type: MembershipAction.GetMembershipsSuccess,
      data: {
        memberships: data,
        totalItems: Number(totalItems)
      }
    });
  }
};

export const readMembershipAction = (
  membershipId: string,
  admin: boolean = false,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartReadRequest });

  const func = admin ? adminGetEarnedMembership : getEarnedMembership;
  const result = await func({ id: membershipId });

  if (isApiErrorResponse(result)) {
    dispatch({
      type: MembershipAction.GetMembershipsFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: MembershipAction.GetMembershipSuccess,
      data: result.data
    });
  }
};


export const createMembershipAction = (
  membershipForm: NewEarnedMembership
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartCreateRequest });

  const result = await adminCreateEarnedMembership({ body: membershipForm });

  if (isApiErrorResponse(result)) {
    dispatch({
      type: MembershipAction.CreateMembershipFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: MembershipAction.CreateMembershipSuccess
    });
  }
};


export const updateMembershipAction = (
  membershipId: string,
  updatedMembership: EarnedMembership
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartUpdateRequest });

  const result = await adminUpdateEarnedMembership({ id: membershipId, body: updatedMembership });

  if (isApiErrorResponse(result)) {
    dispatch({
      type: MembershipAction.UpdateMembershipFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: MembershipAction.UpdateMembershipSuccess,
      data: result.data
    });
  }
};

const defaultState: EarnedMembershipsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  create: {
    isRequesting: false,
    error: ""
  },
  update: {
    isRequesting: false,
    error: "",
  },
  delete: {
    isRequesting: false,
    error: "",
  }
}

export const earnedMembershipsReducer = (state: EarnedMembershipsState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case MembershipAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case MembershipAction.GetMembershipsSuccess:
      const {
        data: {
          memberships,
          totalItems,
        }
      } = action;

      const newMemberships = {};
      memberships.forEach((membership: EarnedMembership) => {
        newMemberships[membership.id] = membership;
      });

      return {
        ...state,
        entities: newMemberships,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case MembershipAction.GetMembershipSuccess:
      const membership = action.data;
      const exists = Object.keys(state.entities).includes(membership.id);
      return {
        ...state,
        entities: {
          ...state.entities,
          [membership.id]: membership
        },
        read: {
          ...state.read,
          ...!exists && {
            totalItems: state.read.totalItems + 1
          },
          isRequesting: false,
          error: ""
        }
      }
    case MembershipAction.GetMembershipsFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case MembershipAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case MembershipAction.CreateMembershipSuccess:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case MembershipAction.CreateMembershipFailure:
      const { error: createError } = action;
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: createError
        }
      }
    case MembershipAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      };
    case MembershipAction.UpdateMembershipSuccess:
      const { data: updatedMembership } = action;
      return {
        ...state,
        entities: {
          ...state.entities,
          [updatedMembership.id]: updatedMembership,
        },
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      };
    case MembershipAction.UpdateMembershipFailure:
      const updateError = action.error;

      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error: updateError
        }
      }
    case MembershipAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case MembershipAction.DeleteMembershipSuccess:
      const id = action.data;
      return {
        ...state,
        entities: omit(state.entities, [id]),
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case MembershipAction.DeleteMembershipFailure:
      const deleteError = action.error;

      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: false,
          error: deleteError
        }
      }
    default:
      return state;
  }
}