import axios from "axios";

import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";

export const postLogin = (creds?) => {
  axios.post(buildJsonUrl(Url.signInPath), {
    member: creds || {}
  })
}

// AuthProvider.resourceName('member');
//   AuthProvider.registerPath('api/members.json');
//   AuthProvider.loginPath('api/members/sign_in.json');
//   AuthProvider.logoutPath('api/members/sign_out.json');
//   AuthProvider.sendResetPasswordInstructionsPath('api/members/password.json');
//   AuthProvider.resetPasswordPath('api/members/password.json');