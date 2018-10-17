import axios from "axios";

import { Url } from "app/constants";
import { buildJsonUrl } from "app/utils";
import { handleApiError } from "api/utils/handleApiError";
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

export const requestNewPassword = async (email: string) => {
  try {
    return await axios.post(buildJsonUrl(Url.Auth.Password), {
      member: {
        email
      }
    });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}

export const putPassword = async (token: string, password: string) => {
  try {
    return await axios.put(buildJsonUrl(Url.Auth.Password), {
      member: {
        resetPasswordToken: token,
        password
      }
    });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}
