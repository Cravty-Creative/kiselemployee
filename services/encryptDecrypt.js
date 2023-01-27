import CryptoJS from "crypto-js";
import { SECRET_KEY } from "./constants";

export const getEncrypt = (value) => {
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

export const getDecrypt = (value) => {
  return CryptoJS.AES.decrypt(value, SECRET_KEY).toString(CryptoJS.enc.Utf8);
};
