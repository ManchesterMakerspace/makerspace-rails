import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

export const buildAccessCardPath = (memberId: string): string => {
  if (memberId) {
    return Url.Admin.AccessCard.replace(Url.PathPlaceholder.CardId, memberId);
  } else {
    return Url.Admin.AccessCards
  }
}

export const buildAccessCardUrl = (cardId?: string): string => {
  return buildJsonUrl(buildAccessCardPath(cardId));
}
