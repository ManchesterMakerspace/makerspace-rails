import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildAccessCardPath = (cardId: string): string => {
  if (cardId) {
    return Url.Admin.AccessCard.replace(Url.PathPlaceholder.CardId, cardId);
  } else {
    return Url.Admin.AccessCards
  }
}

export const buildAccessCardUrl = (cardId?: string): string => {
  return buildJsonUrl(buildAccessCardPath(cardId));
}
