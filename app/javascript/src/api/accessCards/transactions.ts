import axios from "axios";
import { AccessCard } from "app/entities/card";
import { handleApiError } from "api/utils/handleApiError";
import { buildAccessCardUrl } from "api/accessCards/utils";

export const getCards = async (member_id?: string) => {
  try {
    return await axios.get(`${buildAccessCardUrl()}`, { params: { card: member_id }});
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const putCard = async (id: string, details: Partial<AccessCard>) => {
  try {
    return await axios.put(`${buildAccessCardUrl(id)}`, { card: details });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}


export const postCard = async (memberId: string, uid: string) => {
  try {
    return await axios.post(`${buildAccessCardUrl()}`, { card: { memberId, uid } });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const getRejectionCard = async () => {
  try {
    return await axios.get(`${buildAccessCardUrl("new")}`);
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}