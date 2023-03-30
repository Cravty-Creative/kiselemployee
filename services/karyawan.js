import httpCall from ".";
import * as API from "./constants";

export const getTipeKaryawan = async (accessToken) => {
  return await httpCall("GET", API.BASE_URL + API.TIPE_KARYAWAN, null, {
    Authorization: `Bearer ${accessToken}`,
  });
};

export const getAllKaryawan = async (accessToken, first, rows, name, type_id) => {
  return await httpCall(
    "POST",
    API.BASE_URL + API.USER_GET_ALL,
    { first, rows, name, type_id },
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

export const editKaryawan = async (accessToken, data) => {
  return await httpCall("PUT", API.BASE_URL + API.USER_EDIT, data, {
    Authorization: `Bearer ${accessToken}`,
  });
};

export const deleteKaryawan = async (accessToken, user_id) => {
  return await httpCall(
    "DELETE",
    API.BASE_URL + API.USER_DELETE,
    { user_id },
    {
      Authorization: `Bearer ${accessToken}`,
    }
  );
};

export const getAllSection = async (accessToken) => {
  return await httpCall("GET", API.BASE_URL + API.GET_SECTION, null, {
    Authorization: `Bearer ${accessToken}`,
  });
};

export const getDropdownKaryawan = async (accessToken) => {
  return await httpCall("GET", API.BASE_URL + API.GET_DROPDOWN_KARYAWAN, null, {
    Authorization: `Bearer ${accessToken}`,
  });
};
