import axios from "axios";
import { BASE_URL } from "../constants";

export const doHttpCall = async (method, url, headers, data) => {
  let config = {
    method,
    data,
    url: BASE_URL + url,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  let result;

  await axios(config)
    .then((response) => {
      result = response.data;
    })
    .catch((error) => {
      result = error.response.data;
    });

  return result;
};

export const setCookie = async (cookie_name, value) => {
  let config = {
    method: "post",
    url: "/api/cookies",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      cookie_name,
      value,
    }),
  };
  let result;

  await axios(config)
    .then((response) => {
      result = response;
    })
    .catch((error) => {
      result = error.response.data;
    });

  return result;
};

export const logout = async () => {
  let config = {
    method: "post",
    url: "/api/logout",
    headers: {
      "Content-Type": "application/json",
    },
  };
  let result;

  await axios(config)
    .then((response) => {
      result = response.data;
    })
    .catch((error) => {
      result = error.response.data;
    });

  return result;
};
