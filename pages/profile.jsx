import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";
import * as serviceKaryawan from "@/services/karyawan.js";
import { useFormik } from "formik";
import * as yup from "yup";

// Components
import PageHeader from "@/components/PageHeader";
import Content from "@/components/Content";
import Button from "@/components/Button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

// Style
import style from "@/styles/tambah-user.module.css";
import style2 from "@/styles/detail-user.module.css";
import Loading from "@/components/Loading";

// Input Validation
const validationSchema = yup.object().shape({
  username: yup.string().min(4, "minimal 4 digit/karakter").required("masukan username atau NIK anda")
});
const validationPasswordSchema = yup.object().shape({
  old_password: yup.string().min(6, "minimal 6 karakter").required("password lama harus diisi"),
  new_password: yup.string().min(6, "minimal 6 karakter").required("password baru harus diisi"),
});

export default function DetailUser({ access_token, menu = [], activePage, isDisable, userId }) {
  const router = useRouter();
  const toast = useRef(null);

  const [breadcrumb, setBreadcrumb] = useState([
    { label: "Profile", url: activePage },
  ]);
  const [pageLoading, setPageLoading] = useState(true);
  const [optionTipeKaryawan, setOptionTipeKaryawan] = useState([]);
  const [initialUsername, setInitialUsername] = useState("");
  const [visibleChangePassword, setVisibleChangePassword] = useState(false);

  // HTTP/API CALL
  const getTipeKaryawan = () => {
    serviceKaryawan
      .getTipeKaryawan(access_token.token)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Tipe Karyawan", detail: res.data.message, life: 3000 });
        } else {
          let dataTemp = res.data.map((item) => ({ label: item.name, value: item.id }));
          setOptionTipeKaryawan(dataTemp);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
  };

  const getDetailKaryawan = (id) => {
    setPageLoading(true);
    serviceKaryawan
      .getKaryawanById(access_token.token, id)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Data Profile", detail: res.data.message, life: 3000 });
          return router.push("/profile");
        } else {
          const dt = res.data;
          setInitialUsername(dt.username || "")
          formUser.setValues({
            nama_lengkap: dt.name || "",
            username: dt.username || "",
            tipe_karyawan: dt.type_id || "",
            section: dt.section || "",
            lokasi_kerja: dt.work_location || "",
            spv1: dt.spv1_name || "",
            spv1_section: dt.spv1_section || "",
            spv2: dt.spv2_name || "",
            spv2_section: dt.spv2_section || "",
            pekerjaan: dt.job_title || "",
          });
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  const handleEdit = (values) => {
    if (initialUsername === values.username) {
      toast.current.show({ severity: "success", summary: "Berhasil", detail: "Berhasil Mengubah Data Profil", life: 3000 });
      return router.push(`/profile`);
    }

    setPageLoading(true);
    const params = {
      user_id: userId,
      emp_id: userId,
      username: values.username
    };

    serviceKaryawan
      .editKaryawan(access_token.token, params)
      .then((res) => {
        if (res.status !== 202) {
          toast.current.show({ severity: "warn", summary: "Gagal Mengubah Data Profil", detail: res.data.message, life: 3000 });
        } else {
          toast.current.show({ severity: "success", summary: "Berhasil Mengubah Data Profil", detail: res.data.message, life: 3000 });
          setInitialUsername(values.username)
          return router.push(`/profile`);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  const handleEditPassword = () => {
    if (formPassword.values.old_password === formPassword.values.new_password) {
      return toast.current.show({ severity: "warn", summary: "Gagal", detail: "Password lama dan baru tidak boleh sama", life: 3000 });
    }

    setPageLoading(true);
    serviceKaryawan
      .changePassword(access_token.token, { id: userId, ...formPassword.values })
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mengubah Password", detail: res.data.message, life: 3000 });
        } else {
          toast.current.show({ severity: "success", summary: "Berhasil Mengubah Password", detail: res.data.message, life: 3000 });
          formPassword.resetForm()
          return setVisibleChangePassword(false)
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setPageLoading(false);
      });
  }

  const buttonEditTemplate = () => {
    return (
      <div className={style2["header-button"]}>
        <Button onClick={() => router.push(activePage + "?edit=true")}>
          <i className="pi pi-pencil" style={{ fontSize: "12px", marginRight: "10px" }}></i>
          <span>Edit</span>
        </Button>
      </div>
    );
  };

  const formUser = useFormik({
    initialValues: {
      username: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => handleEdit(values),
  });

  const formPassword = useFormik({
    initialValues: {
      old_password: "",
      new_password: ""
    },
    validationSchema: validationPasswordSchema,
    onSubmit: (values) => handleEditPassword(values),
  });

  useEffect(() => {
    getTipeKaryawan();
    getDetailKaryawan(userId);
  }, []);

  useEffect(() => {
    if (!isDisable) {
      setBreadcrumb([
        { label: "Profile", url: '/profile' },
        { label: "Edit", url: activePage },
      ]);
    } else {
      setBreadcrumb([
        { label: "Profile", url: activePage },
      ]);
    }
  }, [isDisable]);

  return (
    <>
      <PageHeader title="Profile" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle='Profile' secondaryTitle='Your personal information' breadcrumbItems={breadcrumb} altHeader={!isDisable ? false : buttonEditTemplate()}>
          <form onSubmit={formUser.handleSubmit} className={style["card"]}>
            <div className={style["personal-info-wrapper"]}>
              <div className={style["title"]}>
                <h4>Personal Info</h4>
                <span>Provide your personal info</span>
              </div>
              <div className={style["field-wrapper"]}>
                <div className={style["field"]}>
                  <label htmlFor="nama_lengkap">Nama Lengkap</label>
                  <InputText
                    type="text"
                    id="nama_lengkap"
                    name="nama_lengkap"
                    placeholder="nama lengkap"
                    disabled
                    value={formUser.values["nama_lengkap"]}
                    onChange={formUser.handleChange}
                    className={`p-inputtext-sm ${formUser.touched["nama_lengkap"] && Boolean(formUser.errors["nama_lengkap"]) ? "p-invalid" : ""}`}
                  />
                  {formUser.touched["nama_lengkap"] && Boolean(formUser.errors["nama_lengkap"]) && <div className="error-field">{formUser.errors["nama_lengkap"]}</div>}
                </div>
                {!isDisable && (<small className={style['edit-note']}>silahkan hubungi administrator untuk perubahan nama lengkap</small>)}
                <div className={style["double-wrapper"]}>
                  <div className={style["field"]}>
                    <label htmlFor="username">Username</label>
                    <InputText
                      type="text"
                      id="username"
                      name="username"
                      placeholder="username"
                      disabled={isDisable}
                      value={formUser.values["username"]}
                      onChange={formUser.handleChange}
                      className={`p-inputtext-sm ${formUser.touched["username"] && Boolean(formUser.errors["username"]) ? "p-invalid" : ""}`}
                    />
                    {formUser.touched["username"] && Boolean(formUser.errors["username"]) && <div className="error-field">{formUser.errors["username"]}</div>}
                  </div>
                </div>
                {(!isDisable && !visibleChangePassword) && <Button onClick={() => setVisibleChangePassword(true)}>Ubah Password</Button>}
                {(!isDisable && visibleChangePassword) && (
                  <div className={style['change-password-wrapper']}>
                    <div className={style["double-wrapper"]}>
                      <div className={style["field"]}>
                        <label htmlFor="old_password">Password Lama</label>
                        <Password
                          type="text"
                          id="old_password"
                          name="old_password"
                          placeholder="password lama"
                          value={formPassword.values['old_password']}
                          onChange={formPassword.handleChange}
                          className={`p-inputtext-sm ${formUser.touched["old_password"] && Boolean(formUser.errors["old_password"]) ? "p-invalid" : ""}`}
                          toggleMask
                          inputStyle={{ width: "100%" }}
                        />
                        {formUser.touched["old_password"] && Boolean(formUser.errors["old_password"]) && <div className="error-field">{formUser.errors["old_password"]}</div>}
                      </div>
                      <div className={style["field"]}>
                        <label htmlFor="new_password">Password Baru</label>
                        <Password
                          type="text"
                          id="new_password"
                          name="new_password"
                          placeholder="password baru"
                          value={formPassword.values['new_password']}
                          onChange={formPassword.handleChange}
                          className={`p-inputtext-sm ${formUser.touched["new_password"] && Boolean(formUser.errors["new_password"]) ? "p-invalid" : ""}`}
                          toggleMask
                          inputStyle={{ width: "100%" }}
                        />
                        {formUser.touched["new_password"] && Boolean(formUser.errors["new_password"]) && <div className="error-field">{formUser.errors["new_password"]}</div>}
                      </div>
                    </div>
                    <div className={`${style["footer-form"]} ${style["change-password"]}`}>
                      <span className={style["notes"]}></span>
                      <div className={style["button-group"]}>
                        <Button secondary type="button" onClick={() => { setVisibleChangePassword(false); formPassword.resetForm }}>
                          Batal
                        </Button>
                        <Button type="button" onClick={handleEditPassword}>Ganti Password</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Divider style={{ margin: 0 }} />
            <div className={style["personal-info-wrapper"]}>
              <div className={style["title"]}>
                <h4>Professional Info</h4>
                <span>Provide your professional info</span>
              </div>
              <div className={style["field-wrapper"]}>
                <div className={style["field"]}>
                  <label htmlFor="tipe-karyawan">Tipe Karyawan</label>
                  <Dropdown
                    id="tipe_karyawan"
                    name="tipe_karyawan"
                    disabled
                    options={optionTipeKaryawan}
                    value={formUser.values.tipe_karyawan}
                    onChange={(e) => formUser.setValues({ ...formUser.values, tipe_karyawan: e.value })}
                    placeholder="tipe karyawan"
                    className={`${style["dropdown-tipe-user"]} ${formUser.touched["tipe_karyawan"] && Boolean(formUser.errors["tipe_karyawan"]) ? "p-invalid" : ""}`}
                  />
                  {formUser.touched["tipe_karyawan"] && Boolean(formUser.errors["tipe_karyawan"]) && <div className="error-field">{formUser.errors["tipe_karyawan"]}</div>}
                </div>
                <div className={style["field"]}>
                  <label htmlFor="pekerjaan">Pekerjaan</label>
                  <InputText
                    type="text"
                    id="pekerjaan"
                    name="pekerjaan"
                    placeholder="nama pekerjaan"
                    disabled
                    value={formUser.values["pekerjaan"]}
                    onChange={formUser.handleChange}
                    className={`p-inputtext-sm ${formUser.touched["pekerjaan"] && Boolean(formUser.errors["pekerjaan"]) ? "p-invalid" : ""}`}
                  />
                  {formUser.touched["pekerjaan"] && Boolean(formUser.errors["pekerjaan"]) && <div className="error-field">{formUser.errors["pekerjaan"]}</div>}
                </div>
                <div className={style["double-wrapper"]}>
                  <div className={style["field"]}>
                    <label htmlFor="section">Bagian</label>
                    <InputText
                      type="text"
                      id="section"
                      name="section"
                      placeholder="bagian"
                      disabled
                      value={formUser.values["section"]}
                      onChange={formUser.handleChange}
                      className={`p-inputtext-sm ${formUser.touched["section"] && Boolean(formUser.errors["section"]) ? "p-invalid" : ""}`}
                    />
                    {formUser.touched["section"] && Boolean(formUser.errors["section"]) && <div className="error-field">{formUser.errors["section"]}</div>}
                  </div>
                  <div className={style["field"]}>
                    <label htmlFor="lokasi_kerja">Lokasi Kerja</label>
                    <InputText
                      type="text"
                      id="lokasi_kerja"
                      name="lokasi_kerja"
                      placeholder="lokasi kerja"
                      disabled
                      value={formUser.values["lokasi_kerja"]}
                      onChange={formUser.handleChange}
                      className={`p-inputtext-sm ${formUser.touched["lokasi_kerja"] && Boolean(formUser.errors["lokasi_kerja"]) ? "p-invalid" : ""}`}
                    />
                    {formUser.touched["lokasi_kerja"] && Boolean(formUser.errors["lokasi_kerja"]) && <div className="error-field">{formUser.errors["lokasi_kerja"]}</div>}
                  </div>
                </div>
                <div className={style["double-wrapper"]}>
                  <div className={style["field"]}>
                    <label htmlFor="spv1">Supervisor 1</label>
                    <InputText
                      type="text"
                      id="spv1"
                      name="spv1"
                      placeholder="supervisor 1"
                      disabled
                      value={formUser.values["spv1"]}
                      onChange={formUser.handleChange}
                      className={`p-inputtext-sm ${formUser.touched["spv1"] && Boolean(formUser.errors["spv1"]) ? "p-invalid" : ""}`}
                    />
                    {formUser.touched["spv1"] && Boolean(formUser.errors["spv1"]) && <div className="error-field">{formUser.errors["spv1"]}</div>}
                  </div>
                  <div className={style["field"]}>
                    <label htmlFor="spv1_section">Bagian Supervisor 1</label>
                    <InputText
                      type="text"
                      id="spv1_section"
                      name="spv1_section"
                      placeholder="bagian supervisor 1"
                      disabled
                      value={formUser.values["spv1_section"]}
                      onChange={formUser.handleChange}
                      className={`p-inputtext-sm ${formUser.touched["spv1_section"] && Boolean(formUser.errors["spv1_section"]) ? "p-invalid" : ""}`}
                    />
                    {formUser.touched["spv1_section"] && Boolean(formUser.errors["spv1_section"]) && <div className="error-field">{formUser.errors["spv1_section"]}</div>}
                  </div>
                </div>
                <div className={style["double-wrapper"]}>
                  <div className={style["field"]}>
                    <label htmlFor="spv2">Supervisor 2</label>
                    <InputText
                      type="text"
                      className="p-inputtext-sm"
                      id="spv2"
                      name="spv2"
                      placeholder="supervisor 2"
                      value={formUser.values["spv2"]}
                      onChange={formUser.handleChange}
                      disabled
                    />
                  </div>
                  <div className={style["field"]}>
                    <label htmlFor="spv2_section">Bagian Supervisor 1</label>
                    <InputText
                      type="text"
                      className="p-inputtext-sm"
                      id="spv2_section"
                      name="spv2_section"
                      placeholder="bagian supervisor 2"
                      value={formUser.values["spv2_section"]}
                      onChange={formUser.handleChange}
                      disabled
                    />
                  </div>
                </div>
                {!isDisable && (<small className={style['edit-note']}>silahkan hubungi administrator untuk perubahan data professional</small>)}
                {!isDisable && (
                  <div className={style["footer-form"]}>
                    <span className={style["notes"]}></span>
                    <div className={style["button-group"]}>
                      <Button secondary type="button" onClick={() => router.push(`/profile`)}>
                        Back
                      </Button>
                      <Button type="submit">Save</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Content>
      </AppContext.Provider>
      <Toast ref={toast} />
      <Loading visible={pageLoading} />
    </>
  );
}

export async function getServerSideProps(context) {
  const { req, resolvedUrl, query } = context;

  const access_token = req.cookies.access_token ? JSON.parse(getDecrypt(JSON.parse(JSON.stringify(req.cookies.access_token)))) : null;
  const menu = req.cookies.menu ? JSON.parse(getDecrypt(JSON.parse(JSON.stringify(req.cookies.menu)))) : null;
  const isDisable = query.edit === "true" ? false : true;

  return {
    props: {
      access_token,
      menu,
      activePage: resolvedUrl,
      isDisable: isDisable,
      userId: access_token.id,
    },
  };
}
