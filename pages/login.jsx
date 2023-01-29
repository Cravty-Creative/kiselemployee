import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import Image from "next/image";
import style from "@/styles/login.module.css";
import httpCall from "@/services";
import { getEncrypt } from "@/services/encryptDecrypt";
import * as yup from "yup";
import * as API from "@/services/constants";
import * as serviceAuth from "@/services/auth";
import * as menu from "@/services/menu";

// Components
import PageHeader from "@/components/PageHeader";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

// Image
import logoTelkomsel from "@/public/logo_telkomsel.png";

// Input Validation
const validationSchema = yup.object().shape({
  username: yup.string().min(4, "minimal 4 digit/karakter").required("masukan username atau NIK anda"),
  password: yup.string().min(6, "minimal 6 karakter").required("password harus diisi"),
});

export default function Login() {
  const router = useRouter();
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    const { username, password } = formLogin.values;

    serviceAuth
      .login({ username, password })
      .then(async (res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Login Gagal", detail: res.data.message, life: 3000 });
        } else {
          toast.current.show({ severity: "success", summary: "Login Berhasil", detail: "Login berhasil, anda akan diarahkan ke dashboard", life: 3000 });

          // set access token ke cookies
          await httpCall(
            "POST",
            API.COOKIES,
            JSON.stringify({
              cookie_name: "access_token",
              value: getEncrypt(JSON.stringify(res.data)),
            })
          );

          // set menu akses ke cookies
          const getMenuValue = {
            admin: menu.ADMIN,
            karyawan: menu.KARYAWAN,
          };

          await httpCall(
            "POST",
            API.COOKIES,
            JSON.stringify({
              cookie_name: "menu",
              value: getEncrypt(JSON.stringify(getMenuValue[res.data.role])),
            })
          );

          // reload halaman
          router.reload();
        }
      })
      .catch((err) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: err.response, life: 3000 });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formLogin = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: () => handleLogin(),
  });

  return (
    <>
      <PageHeader title="Login" />
      <div className={style["logo-telkomsel"]}>
        <Image src={logoTelkomsel} alt="Logo Telkomsel" />
      </div>
      <div className={style["wrapper"]}>
        <h1 className={style["header-1"]}>Sistem Penilaian Kinerja Karyawan</h1>
        <form onSubmit={formLogin.handleSubmit} className={style["body"]}>
          <div className={style["body-header"]}>
            <h1>Login</h1>
            <h3>Enter your account credentials</h3>
          </div>
          <div className={style["input-group"]}>
            <label htmlFor="username">Username / NIK</label>
            <InputText
              id="username"
              name="username"
              onChange={formLogin.handleChange}
              placeholder="masukan NIK anda"
              className={formLogin.touched["username"] && Boolean(formLogin.errors["username"]) ? "p-invalid" : ""}
            />
            {formLogin.touched["username"] && Boolean(formLogin.errors["username"]) && <div className="error-field">{formLogin.errors["username"]}</div>}
          </div>
          <div className={style["input-group"]}>
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              name="password"
              onChange={formLogin.handleChange}
              placeholder="masukan password anda"
              toggleMask
              feedback={false}
              className={`${style["password-field"]} ${formLogin.touched["username"] && Boolean(formLogin.errors["username"]) ? "p-invalid" : ""}`}
            />
            {formLogin.touched["password"] && Boolean(formLogin.errors["password"]) && <div className="error-field">{formLogin.errors["password"]}</div>}
          </div>
          <Button label="Login" loading={loading} iconPos="right" type="submit" className={style["button-login"]} />
        </form>
        <h2 className={style["header-2"]}>
          by <span className={style["medium-bold"]}>PT. Koperasi Telekomunikasi Seluler</span>
        </h2>
      </div>
      <Toast ref={toast} />
    </>
  );
}
