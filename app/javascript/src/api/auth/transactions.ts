import axios from "axios";

import { Url } from "app/constants";
import { buildJsonUrl, handleApiError } from "app/utils";
import { AuthForm, SignUpForm } from "ui/auth/interfaces";
import { buildEmailCheckPath } from "api/auth/utils";

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

export const checkEmailExists = async (email: string) => {
  try {
    const response = await axios.post(`${buildEmailCheckPath()}`, { params: email });
    const exists = response.status === 200 ? true : false;
    return exists;
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const postSignUp = async (signUpForm: SignUpForm) => {
  try {
    return await axios.post(buildJsonUrl(Url.Auth.SignUp), {
      member: signUpForm
    });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}