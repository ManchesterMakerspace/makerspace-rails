import { MockMakerspaceApi } from "makerspace-ts-mock-client";
import memberPO from "../pageObjects/member";
import utils from "../pageObjects/common";
import { LoginMember } from "../pageObjects/auth";

  /*
  * Application tries to sign in the current user using cookies
  * This fakes that iniital request to automatically sign in the user
  * and skips the landing page
  */
 export const autoLogin = async (mocker: MockMakerspaceApi, user: LoginMember, destination?: string, permissions = {}) => {
  const profileUrl = memberPO.getProfilePath(user.id);
  const destinationUrl = destination || profileUrl;
  mocker.signIn_200({ body: {} }, user);
  mocker.listMembersPermissions_200({ id: user.id }, permissions);
  // If no destination, mock default member profile redirect
  if (!destination) {
    mocker.getMember_200({ id: user.id }, user);
  }
  const fullUrl = utils.buildUrl(destinationUrl);
  return browser.url(fullUrl).then(() => {
    return utils.waitForPageLoad(fullUrl, true);
  })
}