import { useState, useRef } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import * as yup from "yup";

// Component
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";

// Validation
const validationSchema = yup.object().shape({
  nik: yup.string().min(13, "minimal 13 digit/karakter").required("masukan NIK anda"),
  password: yup.string().min(6, "minimal 6 karakter").required("password harus diisi"),
});

export default function Login() {
  const router = useRouter();
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {};

  const formLogin = useFormik({
    initialValues: {
      nik: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: () => handleLogin(),
  });

  return (
    <>
      <div>Login Page</div>
    </>
  );
}
