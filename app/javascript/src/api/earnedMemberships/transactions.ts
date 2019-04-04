import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { buildMembershipUrl, buildReportsUrl } from "api/earnedMemberships/utils";
import { handleApiError } from "api/utils/handleApiError";
import { QueryParams } from "app/interfaces";
import { EarnedMembership, NewReport } from "app/entities/earnedMembership";

export const getMemberships = async (queryparams?: QueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Admin.EarnedMemberships), { params: queryparams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const getMembership = async (membershipId: string, admin?: boolean) => {
  try {
    return await axios.get(buildMembershipUrl(membershipId, admin));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const putMembership = async (id: string, details: Partial<EarnedMembership>) => {
  try {
    return await axios.put(buildMembershipUrl(id, true), { earnedMembership: details });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const postMembership = async (details: Partial<EarnedMembership>) => {
  try {
    return await axios.post(buildJsonUrl(Url.Admin.EarnedMemberships), { earnedMembership: details });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const getReports = async (membershipId: string, queryparams: QueryParams, isAdmin: boolean) => {
  try {
    return await axios.get(buildReportsUrl(membershipId, isAdmin), { params: queryparams });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const postReport = async (details: NewReport) => {
  try {
    return await axios.post(buildReportsUrl(details.earnedMembershipId, false), { report: details });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}