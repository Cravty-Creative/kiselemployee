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
export const GET_DROPDOWN_KARYAWAN = "/user/karyawan/getall";
export const NILAI_GET_ALL = "/nilai/getall";
export const NILAI_EDIT = "/nilai/edit";
export const NILAI_DELETE = "/nilai/delete";
export const NILAI_CREATE = "/nilai/create";
export const PRESENSI_GET_ALL = "/presensi/getall";
export const PRESENSI_CREATE = "/presensi/create";
export const PRESENSI_EDIT = "/presensi/edit";
export const PRESENSI_DELETE = "/presensi/delete";

export const LIST_BULAN = [
  { label: "Januari", value: "January" },
  { label: "Februari", value: "February" },
  { label: "Maret", value: "March" },
  { label: "April", value: "April" },
  { label: "Mei", value: "May" },
  { label: "Juni", value: "June" },
  { label: "Juli", value: "July" },
  { label: "Agustus", value: "August" },
  { label: "September", value: "September" },
  { label: "Oktober", value: "October" },
  { label: "November", value: "November" },
  { label: "Desember", value: "December" },
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
