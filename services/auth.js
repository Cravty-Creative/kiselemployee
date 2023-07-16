import httpCall from ".";
import * as API from "./constants";

// SERVICE AUTENTIKASI
export const logout = async () => {
  localStorage.clear();

  await httpCall("POST", API.COOKIES, {
    cookie_name: "access_token",
    value: null,
    max_age: 0,
  });

  await httpCall("POST", API.COOKIES, {
    cookie_name: "menu",
    value: null,
    max_age: 0,
  });

  return;
};

export const login = async (data) => {
  return await httpCall("POST", API.BASE_URL + API.AUTH_LOGIN, data, null);
};
