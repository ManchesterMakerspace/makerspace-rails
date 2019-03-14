import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";
import omit from "lodash-es/omit";

import { QueryParams } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

import { Action as MembershipAction } from "ui/earnedMemberships/constants";
import { EarnedMembershipsState } from "ui/earnedMemberships/interfaces";
import { getMemberships, getMembership, postMembership, putMembership } from "api/earnedMemberships/transactions";
import { EarnedMembership, NewEarnedMembership } from "app/entities/earnedMembership";


export const readMembershipsAction = (
  queryParams?: QueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartReadRequest });

  try {
    const response = await getMemberships(queryParams);
    const {earnedMemberships} = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: MembershipAction.GetMembershipsSuccess,
      data: {
        memberships: earnedMemberships,
        totalItems: toNumber(totalItems)
      }
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MembershipAction.GetMembershipsFailure,
      error: errorMessage
    });
  }
};

export const readMembershipAction = (
  membershipId: string,
  admin: boolean = false,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartReadRequest });

  try {
    const response = await getMembership(membershipId, admin);
    const { earnedMembership } = response.data;
    dispatch({
      type: MembershipAction.GetMembershipSuccess,
      data: earnedMembership
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MembershipAction.GetMembershipsFailure,
      error: errorMessage
    });
  }
};


export const createMembershipAction = (
  membershipForm: NewEarnedMembership
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartCreateRequest });

  try {
    const response = await postMembership(membershipForm);
    dispatch({
      type: MembershipAction.CreateMembershipSuccess,
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MembershipAction.CreateMembershipFailure,
      error: errorMessage
    });
  }
};


export const updateMembershipAction = (
  membershipId: string,
  updatedMembership: Partial<EarnedMembership>
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartUpdateRequest });

  try {
    const response = await putMembership(membershipId, updatedMembership);
    const { Membership } = response.data;
    dispatch({
      type: MembershipAction.UpdateMembershipSuccess,
      data: Membership
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MembershipAction.UpdateMembershipFailure,
      error: errorMessage
    })
  }
};


export const deleteMembershipAction = (
  membershipId: string,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembershipAction.StartDeleteRequest });

  try {
    await getMembership(membershipId);
    dispatch({
      type: MembershipAction.DeleteMembershipSuccess,
      data: membershipId
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: MembershipAction.DeleteMembershipFailure,
      error: errorMessage
    });
  }
}

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