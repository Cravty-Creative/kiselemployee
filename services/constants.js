export const BASE_URL = "http://localhost:8000";
export const SECRET_KEY = "goriorio";
export const AUTH_LOGIN = "/login";
export const COOKIES = "/api/cookies";
export const TIPE_KARYAWAN = "/employee/type";
export const USER_GET_ALL = "/user/getall";
export const USER_CREATE = "/user/create";
export const USER_EDIT = "/user/edit";
export const USER_DELETE = "/user/delete";
export const USER_GET_BY_ID = "/user/getbyid";
export const GET_SECTION = "/user/karyawan/getsection";

export const LIST_BULAN = [
  { label: "Januari", value: "JANUARI" },
  { label: "Februari", value: "FEBRUARI" },
  { label: "Maret", value: "MARET" },
  { label: "April", value: "APRIL" },
  { label: "Mei", value: "MEI" },
  { label: "Juni", value: "JUNI" },
  { label: "Juli", value: "JULI" },
  { label: "Agustus", value: "AGUSTUS" },
  { label: "September", value: "SEPTEMBER" },
  { label: "Oktober", value: "OKTOBER" },
  { label: "November", value: "NOVEMBER" },
  { label: "Desember", value: "DESEMBER" },
];

const getTahun = () => {
  const firstYear = new Date().getFullYear() - 15;
  const secondYear = new Date().getFullYear() + 10;

  let result = [];
  for (let i = firstYear; i < secondYear; i++) {
    result.push({ label: i, value: i });
  }

  return result;
};

export const LIST_TAHUN = getTahun();
