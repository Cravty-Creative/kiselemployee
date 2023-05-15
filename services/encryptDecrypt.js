import CryptoJS from "crypto-js";
import { SECRET_KEY } from "./constants";

export const getEncrypt = (value) => {
  try {
    const result = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    return result;
  } catch (error) {
    return null;
  }
};

export const getDecrypt = (value) => {
  try {
    const result = CryptoJS.AES.decrypt(value, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    return result;
  } catch (error) {
    return null;
  }
};
