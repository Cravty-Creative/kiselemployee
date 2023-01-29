import httpCall from ".";
import * as API from "./constants";

export const getTipeKaryawan = async (accessToken) => {
  return await httpCall("GET", API.BASE_URL + API.TIPE_KARYAWAN, null, {
    Authorization: `Bearer ${accessToken}`,
  });
};

export const getAllKaryawan = async (accessToken, first, rows) => {
  return await httpCall(
    "POST",
    API.BASE_URL + API.USER_GET_ALL,
    { first, rows },
    {
      Authorization: `Bearer ${accessToken}`,
    }
  );
};

export const addKaryawan = async (accessToken, data) => {
  return await httpCall("POST", API.BASE_URL + API.USER_CREATE, data, {
    Authorization: `Bearer ${accessToken}`,
  });
};

export const getKaryawanById = async (accessToken, id) => {
  return await httpCall(
    "POST",
    API.BASE_URL + API.USER_GET_BY_ID,
    { id },
    {
      Authorization: `Bearer ${accessToken}`,
    }
  );
};
