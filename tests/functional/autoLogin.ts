import { mock, mockRequests } from "./mockserver-client-helpers";
import memberPO from "../pageObjects/member";
import utils from "../pageObjects/common";
import { LoginMember } from "../pageObjects/auth";

  /*
  * Application tries to sign in the current user using cookies
  * This fakes that iniital request to automatically sign in the user
  * and skips the landing page
  */
 export const autoLogin = async (user: LoginMember, destination?: string, permissions = {}) => {
  const profileUrl = memberPO.getProfilePath(user.id);
  const destinationUrl = destination || profileUrl;
  await mock(mockRequests.signIn.ok(user));
  await mock(mockRequests.permission.get.ok(user.id, permissions));
  // If no destination, mock default member profile redirect
  if (!destination) {
    await mock(mockRequests.member.get.ok(user.id, user));
  }
  const fullUrl = utils.buildUrl(destinationUrl);
  return browser.get(fullUrl).then(() => {
    return utils.waitForPageLoad(fullUrl, true);
  })
}