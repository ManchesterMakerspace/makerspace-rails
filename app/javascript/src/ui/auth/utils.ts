import { Routing } from "app/constants";

export const buildProfileRouting = (memberId: string) => {
  return Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);
};
