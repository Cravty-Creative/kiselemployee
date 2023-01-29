import axios from "axios";

export default async function httpCall(method, url, data = null, headers = null) {
  let result = null;

  let config = {
    method: method,
    url: url,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data !== null) {
    config.data = data;
  }

  if (headers !== null) {
    config.headers = { ...config.headers, ...headers };
  }

  await axios(config)
    .then((response) => {
      result = response;
    })
    .catch((error) => {
      result = error.response;
    });

  return result;
}
