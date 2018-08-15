import axios from "axios";
import { buildJsonUrl, handleApiError } from "app/utils";
import { Url } from "app/constants";
import RenewalForm from "ui/common/RenewalForm";
import { MemberDetails } from "app/entities/member";
import { buildMemberUrl } from "api/member/utils";

export const getMember = async (id: string) => {
  try {
    return await axios.get(`${buildMemberUrl(id)}`);
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const updateMember = async (id: string, details: Partial<MemberDetails>) => {
  try {
    return await axios.put(`${buildMemberUrl(id, true)}`, { member: details });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}