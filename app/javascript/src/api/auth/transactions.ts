import axios from "axios";

import { Url } from "app/constants";
import { buildJsonUrl, handleApiError } from "app/utils";
import { AuthForm, MemberSignUpForm } from "ui/auth/interfaces";

export const postLogin = async (creds?: AuthForm) => {
  try {
    return await axios.post(buildJsonUrl(Url.Auth.SignIn), {
      member: creds || {}
    });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const deleteLogin = async () => {
  try {
    return await axios.delete(buildJsonUrl(Url.Auth.SignOut));
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
};

export const postSignUp = async (signUpForm: MemberSignUpForm) => {
  try {
    return await axios.post(buildJsonUrl(Url.Auth.SignUp), {
      member: signUpForm
    });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}