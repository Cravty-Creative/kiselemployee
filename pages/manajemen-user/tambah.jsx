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
import Loading from "@/components/Loading";

// Input Validation
const validationSchema = yup.object().shape({
  nama_lengkap: yup.string().min(3, "minimal 3 karakter").required("masukan nama lengkap anda"),
  username: yup.string().min(4, "minimal 4 digit/karakter").required("masukan username atau NIK anda"),
  password: yup.string().min(6, "minimal 6 karakter").required("password harus diisi"),
  tipe_user: yup
    .string()
    .required("pilih salah satu tipe user")
    .test("tipe-user", "pilih salah satu tipe user", (value) => {
      if (value === "") {
        return false;
      }
      return true;
    }),
  tipe_karyawan: yup
    .number()
    .required("pilih salah satu tipe karyawan")
    .test("tipe-karyawan", "pilih salah satu tipe karyawan", (value) => {
      if (value === "") {
        return false;
      }
      return true;
    }),
  section: yup.string().min(3, "minimal 3 karakter").required("masukan bagian pekerjaan anda"),
  lokasi_kerja: yup.string().min(3, "minimal 3 karakter").required("masukan lokasi kerja anda"),
  spv1: yup.string().min(3, "minimal 3 karakter").required("masukan nama supervisor 1 anda"),
  spv1_section: yup.string().min(3, "minimal 3 karakter").required("masukan bagian pekerjaan supervisor 1 anda"),
  pekerjaan: yup.string().min(3, "minimal 3 karakter").required("masukan nama pekerjaan anda"),
});

export default function TambahUser({ access_token, menu = [], activePage }) {
  const router = useRouter();
  const toast = useRef(null);
  const breadcrumb = [
    { label: "Manajemen User", url: "/manajemen-user" },
    { label: "Tambah User", url: activePage },
  ];

  const optionTipeUser = [
    { label: "Admin", value: "admin" },
    { label: "Karyawan", value: "karyawan" },
  ];

  const [pageLoading, setPageLoading] = useState(false);
  const [loadingTipeKaryawan, setLoadingTipeKaryawan] = useState(true);
  const [optionTipeKaryawan, setOptionTipeKaryawan] = useState([]);

  // HTTP/API CALL
  const getTipeKaryawan = () => {
    setLoadingTipeKaryawan(true);
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
      .finally(() => {
        setLoadingTipeKaryawan(false);
      });
  };

  const handleAdd = () => {
    setPageLoading(true);
    const params = {
      role: formTambah.values.tipe_user,
      username: formTambah.values.username,
      password: formTambah.values.password,
      type_id: formTambah.values.tipe_karyawan,
      name: formTambah.values.nama_lengkap,
      section: formTambah.values.section,
      work_location: formTambah.values.lokasi_kerja,
      job_title: formTambah.values.pekerjaan,
      spv1_name: formTambah.values.spv1,
      spv2_name: formTambah.values.spv2,
      spv1_section: formTambah.values.spv1_section,
      spv2_section: formTambah.values.spv2_section,
    };
    serviceKaryawan
      .addKaryawan(access_token.token, params)
      .then((res) => {
        if (res.status !== 201) {
          toast.current.show({ severity: "warn", summary: "Gagal Menambahkan Karyawan", detail: res.data.message, life: 3000 });
        } else {
          toast.current.show({ severity: "success", summary: "Berhasil Menambahkan Karyawan", detail: res.data.message, life: 3000 });
          router.push("/manajemen-user");
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  const formTambah = useFormik({
    initialValues: {
      nama_lengkap: "",
      username: "",
      password: "",
      tipe_user: "",
      tipe_karyawan: "",
      section: "",
      lokasi_kerja: "",
      spv1: "",
      spv1_section: "",
      spv2: "",
      spv2_section: "",
      pekerjaan: "",
    },
    validationSchema: validationSchema,
    onSubmit: () => handleAdd(),
  });

  useEffect(() => {
    getTipeKaryawan();
  }, []);

  return (
    <>
      <PageHeader title="Tambah User" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Tambah User" secondaryTitle="Add new Employee" breadcrumbItems={breadcrumb}>
          <form onSubmit={formTambah.handleSubmit} className={style["card"]}>
            <div className={style["personal-info-wrapper"]}>
              <div className={style["title"]}>
                <h4>Personal Info</h4>
                <span>Provide your personal info</span>
              </div>
              <div className={style["field-wrapper"]}>
                <div className={style["field"]}>
                  <label htmlFor="nama_lengkap">
                    Nama Lengkap<span className="required-dot">*</span>
                  </label>
                  <InputText
                    type="text"
                    id="nama_lengkap"
                    name="nama_lengkap"
                    placeholder="nama lengkap"
                    onChange={formTambah.handleChange}
                    className={`p-inputtext-sm ${formTambah.touched["nama_lengkap"] && Boolean(formTambah.errors["nama_lengkap"]) ? "p-invalid" : ""}`}
                  />
                  {formTambah.touched["nama_lengkap"] && Boolean(formTambah.errors["nama_lengkap"]) && <div className="error-field">{formTambah.errors["nama_lengkap"]}</div>}
                </div>
                <div className={style["double-wrapper"]}>
                  <div className={style["field"]}>
                    <label htmlFor="username">
                      Username<span className="required-dot">*</span>
                    </label>
                    <InputText
                      type="text"
                      id="username"
                      name="username"
                      placeholder="username"
                      onChange={formTambah.handleChange}
                      className={`p-inputtext-sm ${formTambah.touched["username"] && Boolean(formTambah.errors["username"]) ? "p-invalid" : ""}`}
                    />
                    {formTambah.touched["username"] && Boolean(formTambah.errors["username"]) && <div className="error-field">{formTambah.errors["username"]}</div>}
                  </div>
                  <div className={style["field"]}>
                    <label htmlFor="password">
                      Password<span className="required-dot">*</span>
                    </label>
                    <Password
                      id="password"
                      name="password"
                      inputClassName={style["password-field"]}
                      placeholder="password"
                      toggleMask
                      onChange={formTambah.handleChange}
                      className={`p-inputtext-sm ${formTambah.touched["password"] && Boolean(formTambah.errors["password"]) ? "p-invalid" : ""}`}
                    />
                    {formTambah.touched["password"] && Boolean(formTambah.errors["password"]) && <div className="error-field">{formTambah.errors["password"]}</div>}
                  </div>
                </div>
              </div>
            </div>
            <Divider />
            <div className={style["personal-info-wrapper"]}>
              <div className={style["title"]}>
                <h4>Professional Info</h4>
                <span>Provide your professional info</span>
              </div>
              <div className={style["field-wrapper"]}>
                <div className={style["field"]}>
                  <label htmlFor="tipe-user">
                    Tipe User<span className="required-dot">*</span>
                  </label>
                  <Dropdown
                    id="tipe_user"
                    name="tipe_user"
                    options={optionTipeUser}
                    value={formTambah.values.tipe_user}
                    onChange={(e) => formTambah.setValues({ ...formTambah.values, tipe_user: e.value })}
                    placeholder="tipe user"
                    className={`${style["dropdown-tipe-user"]} ${formTambah.touched["tipe_user"] && Boolean(formTambah.errors["tipe_user"]) ? "p-invalid" : ""}`}
                  />
                  {formTambah.touched["tipe_user"] && Boolean(formTambah.errors["tipe_user"]) && <div className="error-field">{formTambah.errors["tipe_user"]}</div>}
                </div>
                <div className={style["field"]}>
                  <label htmlFor="tipe-karyawan">
                    Tipe Karyawan<span className="required-dot">*</span>
                  </label>
                  <Dropdown
                    id="tipe_karyawan"
                    name="tipe_karyawan"
                    disabled={loadingTipeKaryawan}
                    options={optionTipeKaryawan}
                    value={formTambah.values.tipe_karyawan}
                    onChange={(e) => formTambah.setValues({ ...formTambah.values, tipe_karyawan: e.value })}
                    placeholder="tipe karyawan"
                    className={`${style["dropdown-tipe-user"]} ${formTambah.touched["tipe_karyawan"] && Boolean(formTambah.errors["tipe_karyawan"]) ? "p-invalid" : ""}`}
                  />
                  {formTambah.touched["tipe_karyawan"] && Boolean(formTambah.errors["tipe_karyawan"]) && <div className="error-field">{formTambah.errors["tipe_karyawan"]}</div>}
                </div>
                <div className={style["field"]}>
                  <label htmlFor="pekerjaan">
                    Pekerjaan<span className="required-dot">*</span>
                  </label>
                  <InputText
                    type="text"
                    id="pekerjaan"
                    name="pekerjaan"
                    placeholder="nama pekerjaan"
                    onChange={formTambah.handleChange}
                    className={`p-inputtext-sm ${formTambah.touched["pekerjaan"] && Boolean(formTambah.errors["pekerjaan"]) ? "p-invalid" : ""}`}
                  />
                  {formTambah.touched["pekerjaan"] && Boolean(formTambah.errors["pekerjaan"]) && <div className="error-field">{formTambah.errors["pekerjaan"]}</div>}
                </div>
                <div className={style["double-wrapper"]}>
                  <div className={style["field"]}>
                    <label htmlFor="section">
                      Bagian<span className="required-dot">*</span>
                    </label>
                    <InputText
                      type="text"
                      id="section"
                      name="section"
                      placeholder="bagian"
                      onChange={formTambah.handleChange}
                      className={`p-inputtext-sm ${formTambah.touched["section"] && Boolean(formTambah.errors["section"]) ? "p-invalid" : ""}`}
                    />
                    {formTambah.touched["section"] && Boolean(formTambah.errors["section"]) && <div className="error-field">{formTambah.errors["section"]}</div>}
                  </div>
                  <div className={style["field"]}>
                    <label htmlFor="lokasi_kerja">
                      Lokasi Kerja<span className="required-dot">*</span>
                    </label>
                    <InputText
                      type="text"
                      id="lokasi_kerja"
                      name="lokasi_kerja"
                      placeholder="lokasi kerja"
                      onChange={formTambah.handleChange}
                      className={`p-inputtext-sm ${formTambah.touched["lokasi_kerja"] && Boolean(formTambah.errors["lokasi_kerja"]) ? "p-invalid" : ""}`}
                    />
                    {formTambah.touched["lokasi_kerja"] && Boolean(formTambah.errors["lokasi_kerja"]) && <div className="error-field">{formTambah.errors["lokasi_kerja"]}</div>}
                  </div>
                </div>
                <div className={style["double-wrapper"]}>
                  <div className={style["field"]}>
                    <label htmlFor="spv1">
                      Supervisor 1<span className="required-dot">*</span>
                    </label>
                    <InputText
                      type="text"
                      id="spv1"
                      name="spv1"
                      placeholder="supervisor 1"
                      onChange={formTambah.handleChange}
                      className={`p-inputtext-sm ${formTambah.touched["spv1"] && Boolean(formTambah.errors["spv1"]) ? "p-invalid" : ""}`}
                    />
                    {formTambah.touched["spv1"] && Boolean(formTambah.errors["spv1"]) && <div className="error-field">{formTambah.errors["spv1"]}</div>}
                  </div>
                  <div className={style["field"]}>
                    <label htmlFor="spv1_section">
                      Bagian Supervisor 1<span className="required-dot">*</span>
                    </label>
                    <InputText
                      type="text"
                      id="spv1_section"
                      name="spv1_section"
                      placeholder="bagian supervisor 1"
                      onChange={formTambah.handleChange}
                      className={`p-inputtext-sm ${formTambah.touched["spv1_section"] && Boolean(formTambah.errors["spv1_section"]) ? "p-invalid" : ""}`}
                    />
                    {formTambah.touched["spv1_section"] && Boolean(formTambah.errors["spv1_section"]) && <div className="error-field">{formTambah.errors["spv1_section"]}</div>}
                  </div>
                </div>
                <div className={style["double-wrapper"]}>
                  <div className={style["field"]}>
                    <label htmlFor="spv2">Supervisor 2</label>
                    <InputText type="text" className="p-inputtext-sm" id="spv2" name="spv2" placeholder="supervisor 2" onChange={formTambah.handleChange} />
                  </div>
                  <div className={style["field"]}>
                    <label htmlFor="spv2_section">Bagian Supervisor 1</label>
                    <InputText type="text" className="p-inputtext-sm" id="spv2_section" name="spv2_section" placeholder="bagian supervisor 2" onChange={formTambah.handleChange} />
                  </div>
                </div>
                <div className={style["footer-form"]}>
                  <span className={style["notes"]}>
                    <span className="required-dot">*</span> field ini wajib diisi
                  </span>
                  <div className={style["button-group"]}>
                    <Button secondary onClick={() => router.back()}>
                      Back
                    </Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </div>
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
  const { req, res } = context;
  const access_token = req.cookies.access_token ? JSON.parse(getDecrypt(JSON.parse(JSON.stringify(req.cookies.access_token)))) : null;
  const menu = req.cookies.menu ? JSON.parse(getDecrypt(JSON.parse(JSON.stringify(req.cookies.menu)))) : null;

  return {
    props: {
      access_token,
      menu,
      activePage: context.resolvedUrl,
    },
  };
}
