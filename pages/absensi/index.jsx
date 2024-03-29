import { useState, useEffect, useRef } from "react";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";
import * as serviceKaryawan from "@/services/karyawan.js";
import { useFormik } from "formik";
import * as yup from "yup";

// Components
import PageHeader from "@/components/PageHeader";
import Content from "@/components/Content";
import { Dropdown } from "primereact/dropdown";
import Button from "@/components/Button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";

// Style
import style from "@/styles/absensi-karyawan.module.css";
import { classNames } from "primereact/utils";
import { Divider } from "primereact/divider";
import Loading from "@/components/Loading";

// Input Validation
const validationSchema = yup.object().shape({
  user_id: yup.number().required("wajib memilih karyawan"),
  tgl_absen: yup.string().required("wajib mengisi tanggal absen"),
  jam_masuk: yup.string(),
  skor_masuk: yup.string(),
  status_masuk: yup.string(),
  jam_pulang: yup.string(),
  skor_pulang: yup.string(),
  status_pulang: yup.string(),
});

// HALAMAN ABSENSI
export default function Absensi({ access_token, menu = [], activePage }) {
  const actionMenu = useRef(null);
  const toast = useRef(null);
  const breadcrumb = [{ label: "Absensi Karyawan", url: activePage }];

  // INISIALISASI VARIABLE
  const [pageLoading, setPageLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [optionSection, setOptionSection] = useState([]);
  const [loadingSection, setLoadingSection] = useState(true);
  const [section, setSection] = useState("");
  const [search, setSearch] = useState("");
  const [visibleConfirmDialog, setVisibleConfirmDialog] = useState(false);

  const [tipeDialog, setTipeDialog] = useState("");
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [loadingKaryawan, setLoadingKaryawan] = useState(true);
  const [optionKaryawan, setOptionKaryawan] = useState([]);
  const [isHadirMasuk, setIsHadirMasuk] = useState("hadir");
  const [isHadirKeluar, setIsHadirKeluar] = useState("hadir");
  const [isMasuk, setIsMasuk] = useState(true);

  const [dateFilter, setDateFilter] = useState([new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)]);
  const [dataAbsensi, setDataAbsensi] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
  });

  // FUNGSI SET FORM DIALOG
  const setFormDialog = () => {
    const isAbsensiMasuk = selectedRow.tipe_absen.toLowerCase() === "masuk";
    setIsMasuk(isAbsensiMasuk);

    formik.setFieldValue("user_id", selectedRow.user_id);
    formik.setFieldValue("tgl_absen", new Date(selectedRow.tgl_absen));
    if (isAbsensiMasuk) {
      if (selectedRow.status === "Hadir" && selectedRow.jam) {
        setIsHadirMasuk("hadir");
        formik.setFieldValue("jam_masuk", new Date(`2023/03/17 ${selectedRow.jam}`));
      } else {
        setIsHadirMasuk("tidak_hadir");
        formik.setFieldValue("status_masuk", selectedRow.status);
      }
    } else {
      if (selectedRow.status === "Hadir" && selectedRow.jam) {
        setIsHadirKeluar("hadir");
        formik.setFieldValue("jam_pulang", new Date(`2023/03/17 ${selectedRow.jam}`));
      } else {
        setIsHadirKeluar("tidak_hadir");
        formik.setFieldValue("status_pulang", selectedRow.status);
      }
    }
  };

  const menuItems = [
    {
      label: "Details",
      command: () => {
        setFormDialog();
        setTipeDialog("Detail");
        setVisibleDialog(true);
        getAllKaryawan();
      },
    },
    {
      label: "Edit",
      command: () => {
        setFormDialog();
        getAllKaryawan();
        setTipeDialog("Edit");
        setVisibleDialog(true);
      },
    },
    {
      separator: true,
    },
    {
      label: "Delete",
      command: () => {
        setVisibleConfirmDialog(true);
      },
    },
  ];

  const formatDate = (value, reverse = false) => {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    if (reverse) {
      return `${year}-${month}-${day}`;
    } else {
      return `${day}-${month}-${year}`;
    }
  };

  const dateToObject = (date) => {
    const dateParts = date.split("-");
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-us", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const penentuanSkor = (tipeAbsen, values) => {
    if (tipeAbsen === "masuk") {
      // Penentuan SKOR Masuk
      if (values.status_masuk === "Alfa") {
        return 1;
      } else if (values.status_masuk === "Sakit" || values.status_masuk === "Izin") {
        return 2;
      } else {
        const jamMasuk = new Date(values.jam_masuk);
        if (jamMasuk > new Date(`${formatDate(values.jam_masuk, true)} 09:00:00`.replace(/-/g, "/"))) {
          return 3;
        } else if (
          jamMasuk >= new Date(`${formatDate(values.jam_masuk, true)} 08:00:00`.replace(/-/g, "/")) &&
          jamMasuk <= new Date(`${formatDate(values.jam_masuk, true)} 09:00:00`.replace(/-/g, "/"))
        ) {
          return 4;
        } else if (jamMasuk < new Date(`${formatDate(values.jam_masuk, true)} 08:00:00`.replace(/-/g, "/"))) {
          return 5;
        }
      }
    } else {
      if (values.status_pulang === "Alfa") {
        return 1;
      } else if (values.status_pulang === "Sakit" || values.status_pulang === "Izin") {
        return 2;
      } else {
        const jamPulang = new Date(values.jam_pulang);
        if (jamPulang < new Date(`${formatDate(values.jam_pulang, true)} 16:00:00`.replace(/-/g, "/"))) {
          return 3;
        } else if (
          jamPulang >= new Date(`${formatDate(values.jam_pulang, true)} 16:00:00`.replace(/-/g, "/")) &&
          jamPulang <= new Date(`${formatDate(values.jam_pulang, true)} 17:00:00`.replace(/-/g, "/"))
        ) {
          return 4;
        } else if (jamPulang > new Date(`${formatDate(values.jam_pulang, true)} 17:00:00`.replace(/-/g, "/"))) {
          return 5;
        }
      }
    }
  };

  const onHideDialog = () => {
    setVisibleDialog(false);
    formik.handleReset();
    formik.setFieldValue("jam_masuk", new Date("2023-03-17 08:00:00".replace(/-/g, "/")));
    formik.setFieldValue("jam_pulang", new Date("2023-03-17 17:00:00".replace(/-/g, "/")));
    setIsHadirMasuk("hadir");
    setIsHadirKeluar("hadir");
  };

  // HTTP/API CALL
  const getSection = () => {
    if (optionSection.length > 0) return;
    setLoadingSection(true);
    serviceKaryawan
      .getAllSection(access_token.token)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Section Karyawan", detail: res.data.message, life: 3000 });
        } else {
          let dataTemp = res.data.map((item) => ({ label: item.section, value: item.section }));
          setOptionSection([{ label: "All", value: "" }, ...dataTemp]);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setLoadingSection(false);
      });
  };

  const getAllKaryawan = () => {
    if (optionKaryawan.length > 0) return;
    setLoadingKaryawan(true);
    serviceKaryawan
      .getDropdownKaryawan(access_token.token)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Data Karyawan", detail: res.data.message, life: 3000 });
        } else {
          setOptionKaryawan(res.data);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setLoadingKaryawan(false);
      });
  };

  const getAllAbsensi = () => {
    setLoadingTable(true);
    const dateFirst = dateFilter[0] ? formatDate(dateFilter[0], true) : null;
    const dateSecond = dateFilter[1] ? formatDate(dateFilter[1], true) : formatDate(dateFilter[0], true);

    serviceKaryawan
      .getAllPresensi(access_token.token, { first: lazyParams.first, rows: lazyParams.rows, section, date_start: dateFirst, date_end: dateSecond })
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Data Absensi", detail: res.data.message, life: 3000 });
        } else {
          const sortedAbsensi = res.data.data.sort((a, b) => {
            if (Date.parse(a.tgl_absen) < Date.parse(b.tgl_absen)) return -1;
            if (Date.parse(a.tgl_absen) > Date.parse(b.tgl_absen)) return 1;
            if (a.nama < b.nama) return -1;
            if (a.nama > b.nama) return 1;
            if (a.user_id < b.user_id) return -1;
            if (a.user_id > b.user_id) return 1;
          });

          let dataTemp = [];

          for (let i = 0; i < sortedAbsensi.length; i++) {
            dataTemp.push({
              no: lazyParams.first + i + 1,
              ...sortedAbsensi[i],
            });
          }

          setDataAbsensi(dataTemp);
          setTotalRecords(res.data.total_rows);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setLoadingTable(false);
      });
  };

  const handleAdd = (values) => {
    setPageLoading(true);
    let skor_masuk = penentuanSkor("masuk", values);
    let skor_pulang = penentuanSkor("pulang", values);

    let params = {
      user_id: values.user_id,
      tgl_absen: formatDate(values.tgl_absen),
      jam_masuk: values.status_masuk === "Hadir" ? formatTime(values.jam_masuk) : null,
      skor_masuk,
      status_masuk: values.status_masuk,
      jam_pulang: values.status_pulang === "Hadir" ? formatTime(values.jam_pulang) : null,
      skor_pulang,
      status_pulang: values.status_pulang,
    };

    serviceKaryawan
      .addPresensi(access_token.token, params)
      .then((res) => {
        toast.current.show({ severity: res.status !== 201 ? "warn" : "success", summary: res.status !== 201 ? "Gagal" : "Berhasil", detail: res.data.message, life: 3000 });
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        onHideDialog();
        setPageLoading(false);
        getAllAbsensi();
      });
  };

  const handleEdit = (values) => {
    setPageLoading(true);
    let tipe = selectedRow.tipe_absen.toLowerCase();

    let params = {
      id: selectedRow.id,
      user_id: selectedRow.user_id,
      tgl_absen: selectedRow.tgl_absen.split("-").reverse().join("-"),
      jam: values["status_" + tipe] === "Hadir" ? formatTime(values["jam_" + tipe]) : null,
      skor: penentuanSkor(tipe, values),
      status: values["status_" + tipe],
    };

    serviceKaryawan
      .editPresensi(access_token.token, params)
      .then((res) => {
        toast.current.show({ severity: res.status !== 202 ? "warn" : "success", summary: res.status !== 202 ? "Gagal" : "Berhasil", detail: res.data.message, life: 3000 });
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        onHideDialog();
        setPageLoading(false);
        getAllAbsensi();
      });
  };

  const handleConfirmDialog = () => {
    setPageLoading(true);

    serviceKaryawan
      .deletePresensi(access_token.token, { id: selectedRow.id })
      .then((res) => {
        toast.current.show({ severity: res.status !== 200 ? "warn" : "success", summary: res.status !== 200 ? "Gagal" : "Berhasil", detail: res.data.message, life: 3000 });
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setPageLoading(false);
        getAllAbsensi();
      });
  };

  const handleActionClick = (event, rowData) => {
    actionMenu.current.toggle(event);
    setSelectedRow(rowData);
  };

  const formik = useFormik({
    initialValues: {
      user_id: "",
      tgl_absen: "",
      jam_masuk: new Date("2023-03-17 08:00:00".replace(/-/g, "/")),
      skor_masuk: "",
      status_masuk: "Hadir",
      jam_pulang: new Date("2023-03-17 17:00:00".replace(/-/g, "/")),
      skor_pulang: "",
      status_pulang: "Hadir",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (tipeDialog === "Tambah") {
        handleAdd(values);
      } else if (tipeDialog === "Edit") {
        handleEdit(values);
      } else {
        return;
      }
    },
  });

  // TEMPLATE
  const actionBodyTemplate = (rowData) => (
    <>
      <Menu model={menuItems} popup ref={actionMenu} id="action-menu" className={style["action-menu"]} />
      <button className={style["button-action"]} onClick={(e) => handleActionClick(e, rowData)}>
        <i className="pi pi-ellipsis-v"></i>
      </button>
    </>
  );

  const isFieldError = (name) => {
    return formik.touched[name] && Boolean(formik.errors[name]);
  };

  const getErrorMessage = (name) => {
    return (
      formik.touched[name] &&
      Boolean(formik.errors[name]) && (
        <small className="error-field" style={{ marginTop: "-6px" }}>
          {formik.errors[name]}
        </small>
      )
    );
  };

  useEffect(() => {
    getSection();
  }, []);

  useEffect(() => {
    getAllAbsensi();
  }, [lazyParams]);

  // HTML ELEMENTS
  return (
    <>
      <PageHeader title="Absensi" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Absensi Karyawan" secondaryTitle="Manage Presences your employees" breadcrumbItems={breadcrumb}>
          <div className={style["button-tab"]}>
            <Button
              onClick={() => {
                setTipeDialog("Tambah");
                setVisibleDialog(true);
                getAllKaryawan();
              }}
            >
              Tambah Absensi
            </Button>
          </div>
          <div className={style["search-wrapper"]}>
            <div className={style["dropdown-body"]}>
              <div className={style["dropdown-wrapper"]}>
                <div className={style["field-wrapper"]}>
                  <label htmlFor="bagian-karyawan">Bagian Karyawan</label>
                  <Dropdown
                    id="bagian-karyawan"
                    disabled={loadingSection}
                    options={optionSection}
                    value={section}
                    onChange={(e) => setSection(e.value)}
                    placeholder="bagian Karyawan"
                    panelClassName={style["dropdown-option"]}
                    className={`${style["dropdown"]} ${style["bagian-karyawan"]}`}
                  />
                </div>
              </div>
              <div className={style["dropdown-wrapper"]}>
                <div className={style["field-wrapper"]}>
                  <label htmlFor="periode-absen">Periode Absensi</label>
                  <Calendar
                    id="periode-absen"
                    placeholder="periode absen"
                    panelClassName={style["dropdown-option"]}
                    className={`${style["dropdown"]} ${style["periode-absen"]}`}
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.value);
                    }}
                    selectionMode="range"
                    readOnlyInput
                  />
                </div>
              </div>
            </div>
            <Button
              className={style["button-search"]}
              onClick={() => {
                getAllAbsensi();
              }}
            >
              <i className="pi pi-search"></i>
              <span>Search</span>
            </Button>
          </div>
          <div className={style["table-wrapper"]}>
            <DataTable
              value={dataAbsensi}
              loading={loadingTable}
              paginator
              id="table-absensi"
              lazy
              first={lazyParams.first}
              rows={lazyParams.rows}
              totalRecords={totalRecords}
              onPage={(e) => {
                setLazyParams((prev) => ({ ...prev, ...e }));
              }}
              rowsPerPageOptions={[5, 10, 20, 30, 40, 50]}
              rowHover
              responsiveLayout="stack"
              breakpoint="960px"
              emptyMessage="Data tidak ditemukan."
              showGridlines
              size="small"
              tableClassName={style["table-data-absensi"]}
            >
              <Column field="no" header="No" className={style["no-column"]} style={{ textAlign: "center" }}></Column>
              <Column field="nama" header="Nama Lengkap"></Column>
              <Column field="tgl_absen" header="Tanggal"></Column>
              <Column field="hari" header="Hari"></Column>
              <Column field="tipe_absen" header="Tipe Absen" style={{ textAlign: "center" }}></Column>
              <Column field="jam" header="Jam Absen" style={{ textAlign: "center" }} body={(e) => e.jam || "-"}></Column>
              <Column field="status" header="Status" style={{ textAlign: "center" }}></Column>
              <Column header="Action" style={{ width: "6%", textAlign: "center" }} className={style["action-column"]} body={actionBodyTemplate}></Column>
            </DataTable>
          </div>
        </Content>
      </AppContext.Provider>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={visibleConfirmDialog}
        onHide={() => setVisibleConfirmDialog(false)}
        message="Apakah anda yakin ingin menghapus data ini?"
        header="Hapus Absensi"
        icon="pi pi-exclamation-triangle"
        accept={handleConfirmDialog}
        draggable={false}
        dismissableMask
        reject={() => setVisibleConfirmDialog(false)}
      />
      <Dialog header={tipeDialog + " Absensi"} visible={visibleDialog} onHide={onHideDialog} style={{ width: "50vw" }} breakpoints={{ "960px": "75vw", "641px": "100vw" }}>
        <form className={style["form-wrapper"]} onSubmit={formik.handleSubmit}>
          <div className={style["field-wrapper"]}>
            <label htmlFor="user_id">Karyawan</label>
            <Dropdown
              id="user_id"
              name="user_id"
              disabled={loadingKaryawan || tipeDialog !== "Tambah"}
              options={optionKaryawan}
              value={tipeDialog === "Tambah" ? formik.values["user_id"] : selectedRow?.user_id ? Number(selectedRow?.user_id) : ""}
              onChange={formik.handleChange}
              placeholder="pilih karyawan"
              optionLabel="name"
              optionValue="id"
              panelClassName={style["dropdown-option"]}
              className={classNames(style["dropdown"], { "p-invalid": isFieldError("user_id") })}
            />
            {getErrorMessage("user_id")}
          </div>
          <div className={style["field-wrapper"]}>
            <label htmlFor="tgl_absen">Tanggal Absensi</label>
            <Calendar
              id="tgl_absen"
              name="tgl_absen"
              placeholder="pilih tanggal absen"
              panelClassName={style["dropdown-option"]}
              className={classNames(`${style["dropdown"]} ${style["periode-absen"]}`, { "p-invalid": isFieldError("tgl_absen") })}
              value={formik.values["tgl_absen"]}
              onChange={formik.handleChange}
              dateFormat="dd/mm/yy"
              readOnlyInput
              disabled={tipeDialog !== "Tambah"}
            />
            {getErrorMessage("tgl_absen")}
          </div>
          <div className={style["detail-absen-wrapper"]}>
            {(tipeDialog === "Tambah" || ((tipeDialog === "Edit" || tipeDialog === "Detail") && isMasuk)) && (
              <div className={style["col-6"]}>
                <span className={style["title-detail-absen"]}>Absensi Masuk</span>
                <div className={style["is-hadir-body"]}>
                  <div className={style["is-hadir-wrapper"]}>
                    <RadioButton
                      inputId="is_hadir_masuk1"
                      name="is_hadir_masuk1"
                      value="hadir"
                      onChange={(e) => {
                        setIsHadirMasuk(e.value);
                        setIsHadirKeluar(e.value);
                        formik.setFieldValue("status_masuk", "Hadir");
                        formik.setFieldValue("status_pulang", "Hadir");
                        formik.setFieldValue("jam_pulang", new Date("2023-03-17 17:00:00".replace(/-/g, "/")));
                      }}
                      checked={isHadirMasuk === "hadir"}
                      disabled={tipeDialog === "Detail"}
                    />
                    <label htmlFor="is_hadir_masuk1">Hadir</label>
                  </div>
                  <div className={style["is-hadir-wrapper"]}>
                    <RadioButton
                      inputId="is_hadir_masuk2"
                      name="is_hadir_masuk2"
                      value="tidak_hadir"
                      onChange={(e) => {
                        setIsHadirMasuk(e.value);
                        setIsHadirKeluar(e.value);
                        formik.setFieldValue("status_masuk", "Alfa");
                        formik.setFieldValue("status_pulang", "Alfa");
                        formik.setFieldValue("jam_pulang", "");
                      }}
                      checked={isHadirMasuk === "tidak_hadir"}
                      disabled={tipeDialog === "Detail"}
                    />
                    <label htmlFor="is_hadir_masuk2">Tidak Hadir</label>
                  </div>
                </div>
                {isHadirMasuk === "hadir" ? (
                  <div className={style["field-wrapper"]}>
                    <label htmlFor="jam_masuk">Jam Absensi</label>
                    <Calendar
                      id="jam_masuk"
                      name="jam_masuk"
                      placeholder="pilih jam masuk"
                      panelClassName={style["dropdown-option"]}
                      className={classNames(`${style["dropdown"]} ${style["periode-absen"]}`)}
                      value={formik.values["jam_masuk"]}
                      onChange={formik.handleChange}
                      timeOnly
                      disabled={tipeDialog === "Detail"}
                    />
                    {getErrorMessage("jam_masuk")}
                  </div>
                ) : (
                  <div className={style["field-wrapper"]}>
                    <label htmlFor="status_masuk">Alasan Tidak Hadir</label>
                    <Dropdown
                      id="status_masuk"
                      name="status_masuk"
                      options={[{ value: "Sakit" }, { value: "Izin" }, { value: "Alfa" }]}
                      value={formik.values["status_masuk"]}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldValue("status_pulang", e.value);
                      }}
                      placeholder="pilih alasan tidak hadir"
                      optionLabel="value"
                      panelClassName={style["dropdown-option"]}
                      className={classNames(style["dropdown"], { "p-invalid": isFieldError("status_masuk") })}
                      disabled={tipeDialog === "Detail"}
                    />
                    {getErrorMessage("status_masuk")}
                  </div>
                )}
              </div>
            )}
            {tipeDialog === "Tambah" && <Divider layout="vertical" />}
            {(tipeDialog === "Tambah" || ((tipeDialog === "Edit" || tipeDialog === "Detail") && !isMasuk)) && (
              <div className={`${style["col-6"]} ${isHadirMasuk === "tidak_hadir" ? style["disable-hadir-pulang"] : ""}`}>
                <span className={style["title-detail-absen"]}>Absensi Pulang</span>
                <div className={style["is-hadir-body"]}>
                  <div className={style["is-hadir-wrapper"]}>
                    <RadioButton
                      inputId="is_hadir_pulang1"
                      name="is_hadir_pulang1"
                      value="hadir"
                      disabled={isHadirMasuk === "tidak_hadir" || tipeDialog === "Detail"}
                      onChange={(e) => {
                        setIsHadirKeluar(e.value);
                        formik.setFieldValue("status_pulang", "Hadir");
                      }}
                      checked={isHadirKeluar === "hadir"}
                    />
                    <label htmlFor="is_hadir_pulang1">Hadir</label>
                  </div>
                  <div className={style["is-hadir-wrapper"]}>
                    <RadioButton
                      inputId="is_hadir_pulang2"
                      name="is_hadir_pulang2"
                      value="tidak_hadir"
                      disabled={isHadirMasuk === "tidak_hadir" || tipeDialog === "Detail"}
                      onChange={(e) => {
                        setIsHadirKeluar(e.value);
                        formik.setFieldValue("status_pulang", "Alfa");
                      }}
                      checked={isHadirKeluar === "tidak_hadir"}
                    />
                    <label htmlFor="is_hadir_pulang2">Tidak Hadir</label>
                  </div>
                </div>
                {isHadirKeluar === "hadir" ? (
                  <div className={style["field-wrapper"]}>
                    <label htmlFor="jam_pulang">Jam Absensi</label>
                    <Calendar
                      id="jam_pulang"
                      name="jam_pulang"
                      placeholder="pilih jam pulang"
                      disabled={isHadirMasuk === "tidak_hadir" || tipeDialog === "Detail"}
                      panelClassName={style["dropdown-option"]}
                      className={classNames(`${style["dropdown"]} ${style["periode-absen"]}`)}
                      value={formik.values["jam_pulang"]}
                      onChange={formik.handleChange}
                      timeOnly
                    />
                    {getErrorMessage("jam_pulang")}
                  </div>
                ) : (
                  <div className={style["field-wrapper"]}>
                    <label htmlFor="status_pulang">Alasan Tidak Hadir</label>
                    <Dropdown
                      id="status_pulang"
                      name="status_pulang"
                      options={[{ value: "Sakit" }, { value: "Izin" }, { value: "Alfa" }]}
                      value={formik.values["status_pulang"]}
                      disabled={isHadirMasuk === "tidak_hadir" || tipeDialog === "Detail"}
                      onChange={formik.handleChange}
                      placeholder="pilih alasan tidak hadir"
                      optionLabel="value"
                      panelClassName={style["dropdown-option"]}
                      className={classNames(style["dropdown"], { "p-invalid": isFieldError("status_pulang") })}
                    />
                    {getErrorMessage("status_pulang")}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={style["form-btn-group"]}>
            <Button onClick={onHideDialog} type="button" secondary>
              {tipeDialog === "Detail" ? "Tutup" : "Batal"}
            </Button>
            {tipeDialog !== "Detail" && (
              <Button onClick={() => {}} type="submit">
                Simpan
              </Button>
            )}
          </div>
        </form>
      </Dialog>
      <Loading visible={pageLoading} />
    </>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
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
