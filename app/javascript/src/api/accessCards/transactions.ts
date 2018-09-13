import axios from "axios";
import { handleApiError } from "app/utils";
import { buildAccessCardUrl } from "api/accessCards/utils";
import { AccessCard } from "app/entities/card";

export const getCard = async (id: string) => {
  try {
    return await axios.get(`${buildAccessCardUrl(id)}`);
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const updateCard = async (id: string, details: Partial<AccessCard>) => {
  try {
    return await axios.put(`${buildAccessCardUrl(id)}`, { card: details });
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