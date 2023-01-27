import httpCall from ".";
import * as API from "./constants";

export const logout = async () => {
  localStorage.clear();
  return await httpCall("POST", API.AUTH_LOGOUT);
};

export const login = async (data) => {
  return await httpCall("POST", API.BASE_URL + API.AUTH_LOGIN, data, null);
};
