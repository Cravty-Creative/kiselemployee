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

export default function TambahUser({ access_token, menu = [], activePage, isDisable, userId }) {
  const router = useRouter();
  const toast = useRef(null);
  const breadcrumb = [
    { label: "Manajemen User", url: "/manajemen-user" },
    { label: "Details User", url: activePage },
  ];

  const optionTipeUser = [
    { label: "Admin", value: "admin" },
    { label: "Karyawan", value: "karyawan" },
  ];

  const [pageLoading, setPageLoading] = useState(false);
  const [loadingTipeKaryawan, setLoadingTipeKaryawan] = useState(true);
  const [optionTipeKaryawan, setOptionTipeKaryawan] = useState([]);
  const [userName, setUserName] = useState("");

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

  const getDetailKaryawan = (id) => {
    serviceKaryawan
      .getKaryawanById(access_token.token, id)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Detail Karyawan", detail: res.data.message, life: 3000 });
          router.push("/manajemen-user");
        } else {
          const dt = res.data;
          setUserName(dt.name);
          formUser.setValues({
            nama_lengkap: dt.name || "",
            username: dt.username || "",
            tipe_user: dt.role || "",
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
      });
  };

  const handleEdit = () => {};

  const formUser = useFormik({
    initialValues: {
      nama_lengkap: "",
      username: "",
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
    onSubmit: () => handleEdit(),
  });

  useEffect(() => {
    getTipeKaryawan();
    getDetailKaryawan(userId);
  }, []);

  return (
    <>
      <PageHeader title="Details User" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle={userName} secondaryTitle="Details User" breadcrumbItems={breadcrumb}>
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
                    disabled={isDisable}
                    value={formUser.values["nama_lengkap"]}
                    onChange={formUser.handleChange}
                    className={`p-inputtext-sm ${formUser.touched["nama_lengkap"] && Boolean(formUser.errors["nama_lengkap"]) ? "p-invalid" : ""}`}
                  />
                  {formUser.touched["nama_lengkap"] && Boolean(formUser.errors["nama_lengkap"]) && <div className="error-field">{formUser.errors["nama_lengkap"]}</div>}
                </div>
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
                  <label htmlFor="tipe-user">Tipe User</label>
                  <Dropdown
                    id="tipe_user"
                    name="tipe_user"
                    options={optionTipeUser}
                    value={formUser.values.tipe_user}
                    onChange={(e) => formUser.setValues({ ...formUser.values, tipe_user: e.value })}
                    disabled
                    placeholder="tipe user"
                    className={`${style["dropdown-tipe-user"]} ${formUser.touched["tipe_user"] && Boolean(formUser.errors["tipe_user"]) ? "p-invalid" : ""}`}
                  />
                  {formUser.touched["tipe_user"] && Boolean(formUser.errors["tipe_user"]) && <div className="error-field">{formUser.errors["tipe_user"]}</div>}
                </div>
                <div className={style["field"]}>
                  <label htmlFor="tipe-karyawan">Tipe Karyawan</label>
                  <Dropdown
                    id="tipe_karyawan"
                    name="tipe_karyawan"
                    disabled={isDisable ? true : loadingTipeKaryawan}
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
                    disabled={isDisable}
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
                      disabled={isDisable}
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
                      disabled={isDisable}
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
                      disabled={isDisable}
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
                      disabled={isDisable}
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
                      disabled={isDisable}
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
                      disabled={isDisable}
                    />
                  </div>
                </div>
                <div className={style["footer-form"]}>
                  <span className={style["notes"]}></span>
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
  const { req, res, resolvedUrl, query, params } = context;
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  if (!isNumber(params.id)) {
    return {
      redirect: {
        destination: "/manajemen-user",
        permanent: false,
      },
    };
  }

  const access_token = req.cookies.access_token ? JSON.parse(getDecrypt(JSON.parse(JSON.stringify(req.cookies.access_token)))) : null;
  const menu = req.cookies.menu ? JSON.parse(getDecrypt(JSON.parse(JSON.stringify(req.cookies.menu)))) : null;
  const isDisable = query.edit === "true" ? false : true;
  const userId = Number(params.id);

  return {
    props: {
      access_token,
      menu,
      activePage: resolvedUrl,
      isDisable: isDisable,
      userId: userId,
    },
  };
}
