import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";
import omit from "lodash-es/omit";

import { QueryParams } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

import { Action as ReportAction } from "ui/reports/constants";
import { ReportsState } from "ui/reports/interfaces";
import { getReports, postReport } from "api/earnedMemberships/transactions";
import { Report, NewReport } from "app/entities/earnedMembership";


export const readReportsAction = (
  membershipId: string,
  queryParams: QueryParams,
  isAdmin: boolean,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: ReportAction.StartReadRequest });

  try {
    const response = await getReports(membershipId, queryParams, isAdmin);
    const { reports } = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: ReportAction.GetReportsSuccess,
      data: {
        reports,
        totalItems: toNumber(totalItems)
      }
    });
  } catch (e) {
    const { errorMessage } = e;
    console.log(e)
    dispatch({
      type: ReportAction.GetReportsFailure,
      error: errorMessage
    });
  }
};

export const createReportAction = (
  reportDetails: NewReport
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: ReportAction.StartCreateRequest });

  try {
    const response = await postReport(reportDetails);
    dispatch({
      type: ReportAction.CreateReportSuccess,
    })
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: ReportAction.CreateReportFailure,
      error: errorMessage
    });
  }
};

const defaultState: ReportsState = {
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
}

export const reportsReducer = (state: ReportsState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case ReportAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case ReportAction.GetReportsSuccess:
      const {
        data: {
          reports,
          totalItems,
        }
      } = action;

      const newReports = {};
      reports.forEach((report: Report) => {
        newReports[report.id] = report;
      });

      return {
        ...state,
        entities: newReports,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case ReportAction.GetReportsFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case ReportAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case ReportAction.CreateReportSuccess:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case ReportAction.CreateReportFailure:
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