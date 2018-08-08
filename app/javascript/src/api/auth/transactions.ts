import axios from "axios";

import { Url } from "app/constants";
import { buildJsonUrl, handleApiError } from "app/utils";
import { AuthForm } from "ui/auth/interfaces";

export const postLogin = async (creds?: AuthForm) => {
  try {
    return await axios.post(buildJsonUrl(Url.SignIn), {
      member: creds || {}
    });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const deleteLogin = async () => {
  try {
    return await axios.delete(buildJsonUrl(Url.SignOut));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

// AuthProvider.resourceName('member');
//   AuthProvider.registerPath('api/members.json');
//   AuthProvider.loginPath('api/members/sign_in.json');
//   AuthProvider.logoutPath('api/members/sign_out.json');
//   AuthProvider.sendResetPasswordInstructionsPath('api/members/password.json');
//   AuthProvider.resetPasswordPath('api/members/password.json');