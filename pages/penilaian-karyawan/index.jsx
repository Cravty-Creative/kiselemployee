import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";
import * as serviceKaryawan from "@/services/karyawan.js";
import { LIST_BULAN, LIST_TAHUN } from "@/services/constants";
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
import { Dialog } from "primereact/dialog";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";

// Style
import style from "@/styles/penilaian-karyawan.module.css";
import { classNames } from "primereact/utils";
import { Divider } from "primereact/divider";

// Input Validation
const validationSchema = yup.object().shape({
  user_id: yup.number().required("wajib memilih karyawan"),
  bulan: yup.string().required("wajib memilih bulan"),
  tahun: yup.string().required("wajib memilih tahun"),
  keaktifan_olahraga: yup.number().required("wajib memilih keaktifan olahraga"),
  keaktifan_keagamaan: yup.number().required("wajib memilih keaktifan keagamaan"),
  keaktifan_sharing_session: yup.number().required("wajib memilih keaktifan sharing session"),
  pengetahuan: yup.number().required("wajib memilih pengetahuan"),
  action_agility: yup.number().required("wajib memilih action agility"),
  action_customer_centric: yup.number().required("wajib memilih action customer centric"),
  action_innovation: yup.number().required("wajib memilih action inovation"),
  action_open_mindset: yup.number().required("wajib memilih action open mindset"),
  action_networking: yup.number().required("wajib memilih action networking"),
});

export default function TambahUser({ access_token, menu = [], activePage }) {
  const router = useRouter();
  const actionMenu = useRef(null);
  const toast = useRef(null);
  const breadcrumb = [{ label: "Penilaian Karyawan", url: activePage }];

  const [visibleConfirmDialog, setVisibleConfirmDialog] = useState(false);
  const [dialogConfirmHeader, setDialogConfirmHeader] = useState("");
  const [dialogConfirmMessage, setDialogConfirmMessage] = useState("");

  const [tipeKaryawan, setTipeKaryawan] = useState(null);
  const [optionTipeKaryawan, setOptionTipeKaryawan] = useState([]);
  const [loadingTipeKaryawan, setLoadingTipeKaryawan] = useState(true);
  const [bulan, setBulan] = useState(LIST_BULAN[new Date().getMonth()].value);
  const [optionBulan, setOptionBulan] = useState(LIST_BULAN);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [optionTahun, setOptionTahun] = useState(LIST_TAHUN);
  const [section, setSection] = useState("");
  const [optionSection, setOptionSection] = useState([]);
  const [loadingSection, setLoadingSection] = useState(true);
  const [search, setSearch] = useState("");
  const [optionListKaryawan, setOptionListKaryawan] = useState([]);
  const [loadingOptionListKaryawan, setLoadingOptionListKaryawan] = useState(true);

  const [visibleDialog, setVisibleDialog] = useState(false);
  const [headerDialog, setHeaderDialog] = useState("");

  const [selectedRow, setSelectedRow] = useState(null);
  const [dataNilai, setDataNilai] = useState([
    {
      no: 1,
      user_id: 4,
      nilai_keaktifan_id: 1,
      nilai_pengetahuan_id: 2,
      nilai_action_id: 3,
      nama: "Alfiansyah2",
      jabatan: "Gudang",
      keaktifan_nilai: 4.57,
      keaktifan_kriteria: 91,
      pengetahuan_nilai: 5.0,
      pengetahuan_kriteria: 100,
      action_nilai: 3.57,
      action_kriteria: 97,
      detail: {
        bulan: "January",
        tahun: 2023,
        keaktifan_olahraga: 5,
        keaktifan_keagamaan: 1,
        keaktifan_sharing_session: 5,
        pengetahuan: 5,
        action_agility: 4,
        action_customer_centric: 4,
        action_innovation: 5,
        action_open_mindset: 3,
        action_networking: 4,
      },
    },
  ]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
  });

  const menuItems = [
    {
      label: "Details",
      command: () => {
        getAllKaryawan();
        setHeaderDialog("Details");
        setVisibleDialog(true);
        formik.setValues({
          user_id: selectedRow.user_id,
          bulan: selectedRow.detail.bulan,
          keaktifan_olahraga: selectedRow.detail.keaktifan_olahraga,
          keaktifan_keagamaan: selectedRow.detail.keaktifan_keagamaan,
          keaktifan_sharing_session: selectedRow.detail.keaktifan_sharing_session,
          pengetahuan: selectedRow.detail.pengetahuan,
          action_agility: selectedRow.detail.action_agility,
          action_customer_centric: selectedRow.detail.action_customer_centric,
          action_innovation: selectedRow.detail.action_innovation,
          action_open_mindset: selectedRow.detail.action_open_mindset,
          action_networking: selectedRow.detail.action_networking,
        });
      },
    },
    {
      label: "Edit",
      command: () => {
        getAllKaryawan();
        setHeaderDialog("Ubah");
        setVisibleDialog(true);
        formik.setValues({
          user_id: selectedRow.user_id,
          bulan: selectedRow.detail.bulan,
          keaktifan_olahraga: selectedRow.detail.keaktifan_olahraga,
          keaktifan_keagamaan: selectedRow.detail.keaktifan_keagamaan,
          keaktifan_sharing_session: selectedRow.detail.keaktifan_sharing_session,
          pengetahuan: selectedRow.detail.pengetahuan,
          action_agility: selectedRow.detail.action_agility,
          action_customer_centric: selectedRow.detail.action_customer_centric,
          action_innovation: selectedRow.detail.action_innovation,
          action_open_mindset: selectedRow.detail.action_open_mindset,
          action_networking: selectedRow.detail.action_networking,
        });
      },
    },
    {
      separator: true,
    },
    {
      label: "Delete",
      command: () => {
        setDialogConfirmHeader("Konfirmasi Hapus");
        setDialogConfirmMessage("Apa anda yakin ingin menghapus data nilai ini?");
        setVisibleConfirmDialog(true);
      },
    },
  ];

  const handleConfirmDialog = () => {};

  // HTTP/API CALL
  const getTipeKaryawan = () => {
    if (optionTipeKaryawan.length > 0) return;
    setLoadingTipeKaryawan(true);
    serviceKaryawan
      .getTipeKaryawan(access_token.token)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Tipe Karyawan", detail: res.data.message, life: 3000 });
        } else {
          let dataTemp = res.data.map((item) => ({ label: item.name, value: item.id }));
          setOptionTipeKaryawan([{ label: "All", value: "" }, ...dataTemp]);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setLoadingTipeKaryawan(false);
      });
  };

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
    if (optionListKaryawan.length > 0) return;
    setLoadingOptionListKaryawan(true);
    serviceKaryawan
      .getDropdownKaryawan(access_token.token)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Data Karyawan", detail: res.data.message, life: 3000 });
        } else {
          setOptionListKaryawan(res.data);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setLoadingOptionListKaryawan(false);
      });
  };

  const getAllPenilaian = () => {};

  const handleActionClick = (event, rowData) => {
    actionMenu.current.toggle(event);
    setSelectedRow(rowData);
  };

  const handleAdd = () => {};

  const handleEdit = () => {};

  const formik = useFormik({
    initialValues: {
      user_id: "",
      bulan: "",
      tahun: "",
      keaktifan_olahraga: "",
      keaktifan_keagamaan: "",
      keaktifan_sharing_session: "",
      pengetahuan: "",
      action_agility: "",
      action_customer_centric: "",
      action_innovation: "",
      action_open_mindset: "",
      action_networking: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (headerDialog === "" || !headerDialog) return;
      if (headerDialog.toLowerCase() === "tambah") {
        handleAdd(values);
      } else if (headerDialog.toLowerCase() === "ubah") {
        handleEdit(values);
      }
    },
  });

  // TEMPLATE
  const actionBodyTemplate = (rowData) => (
    <>
      <Menu model={menuItems} popup ref={actionMenu} id="action-menu" className={style["action-menu"]} onHide={() => setSelectedRow(null)} />
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
        <p className="error-field" style={{ marginTop: "-6px" }}>
          {formik.errors[name]}
        </p>
      )
    );
  };

  const headerTemplate = (
    <ColumnGroup>
      <Row>
        <Column header="No" rowSpan={2} headerStyle={{ width: "4%" }} />
        <Column header="Nama Lengkap" rowSpan={2} />
        <Column header="Jabatan" rowSpan={2} />
        <Column header="Keaktifan" colSpan={2} />
        <Column header="Pengetahuan" colSpan={2} />
        <Column header="Implementasi" colSpan={2} />
        <Column header="Action" rowSpan={2} />
      </Row>
      <Row>
        <Column header="Nilai" field="keaktifan_nilai" />
        <Column header="Nilai Kriteria" field="keaktifan_kriteria" />
        <Column header="Nilai" field="pengetahuan_nilai" />
        <Column header="Nilai Kriteria" field="pengetahuan_kriteria" />
        <Column header="Nilai" field="implementasi_nilai" />
        <Column header="Nilai Kriteria" field="implementasi_kriteria" />
      </Row>
    </ColumnGroup>
  );

  useEffect(() => {
    getTipeKaryawan();
    getSection();
  }, []);

  return (
    <>
      <PageHeader title="Penilaian Karyawan" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Penilaian Karyawan" secondaryTitle="Provide the best value for the best employees" breadcrumbItems={breadcrumb}>
          <div className={style["button-add-wrapper"]}>
            <div className={style["button-tab"]}>
              <Button
                onClick={() => {
                  getAllKaryawan();
                  setHeaderDialog("Tambah");
                  setVisibleDialog(true);
                }}
              >
                Input Nilai Karyawan
              </Button>
            </div>
          </div>
          <div className={style["search-wrapper"]}>
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
              <div className={style["field-wrapper"]}>
                <label htmlFor="bulan">Bulan</label>
                <Dropdown
                  id="bulan"
                  options={optionBulan}
                  value={bulan}
                  onChange={(e) => setBulan(e.value)}
                  placeholder="Bulan"
                  panelClassName={style["dropdown-option"]}
                  className={`${style["dropdown"]} ${style["bulan"]}`}
                />
              </div>
              <div className={style["field-wrapper"]}>
                <label htmlFor="tahun">Tahun</label>
                <Dropdown
                  id="tahun"
                  options={optionTahun}
                  value={tahun}
                  onChange={(e) => setTahun(e.value)}
                  placeholder="Tahun"
                  panelClassName={style["dropdown-option"]}
                  className={`${style["dropdown"]} ${style["tahun"]}`}
                />
              </div>
            </div>
            <div className={style["search-field-wrapper"]}>
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className={`p-inputtext-sm ${style["search-field"]}`} />
              </span>
              <Button className={style["button-search"]} onClick={() => getAllPenilaian()}>
                <i className="pi pi-search"></i>
              </Button>
            </div>
          </div>
          <div className={style["table-wrapper"]}>
            <DataTable
              value={dataNilai}
              loading={loadingTable}
              paginator
              id="table-karyawan"
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
              tableClassName={style["table-data-nilai"]}
              headerColumnGroup={headerTemplate}
            >
              <Column field="no" header="No" className={style["no-column"]}></Column>
              <Column field="nama" header="Nama Lengkap"></Column>
              <Column field="jabatan" header="Jabatan"></Column>
              <Column field="keaktifan_nilai" style={{ width: "5%", textAlign: "center" }}></Column>
              <Column field="keaktifan_kriteria" style={{ width: "11%", textAlign: "center" }}></Column>
              <Column field="pengetahuan_nilai" style={{ width: "5%", textAlign: "center" }}></Column>
              <Column field="pengetahuan_kriteria" style={{ width: "11%", textAlign: "center" }}></Column>
              <Column field="action_nilai" style={{ width: "5%", textAlign: "center" }}></Column>
              <Column field="action_kriteria" style={{ width: "11%", textAlign: "center" }}></Column>
              <Column header="Action" style={{ width: "6%", textAlign: "center" }} className={style["action-column"]} body={actionBodyTemplate}></Column>
            </DataTable>
          </div>
        </Content>
      </AppContext.Provider>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={visibleConfirmDialog}
        onHide={() => setVisibleConfirmDialog(false)}
        message={dialogConfirmMessage}
        header={dialogConfirmHeader}
        icon="pi pi-exclamation-triangle"
        accept={handleConfirmDialog}
        draggable={false}
        dismissableMask
        reject={() => setVisibleConfirmDialog(false)}
      />
      <Dialog
        header={headerDialog + " Nilai"}
        visible={visibleDialog}
        style={{ width: "50vw" }}
        onHide={() => {
          setHeaderDialog("");
          setVisibleDialog(false);
          formik.resetForm();
        }}
      >
        <form className={style["form-dialog-wrapper"]} onSubmit={formik.handleSubmit}>
          <div className={style["field-wrapper"]}>
            <label htmlFor="user_id">Karyawan{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
            <Dropdown
              id="user_id"
              name="user_id"
              options={optionListKaryawan}
              value={formik.values.user_id}
              onChange={formik.handleChange}
              optionLabel="name"
              optionValue="id"
              placeholder="pilih karyawan"
              disabled={headerDialog.toLowerCase() === "details"}
              className={`${style["dropdown"]} ${isFieldError("user_id") && "p-invalid"}`}
            />
            {getErrorMessage("user_id")}
          </div>
          <div className={style["form-btn-wrapper"]}>
            <div className={style["field-wrapper"]}>
              <label htmlFor="bulan">Bulan{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="bulan"
                name="bulan"
                options={optionBulan}
                value={formik.values.bulan}
                onChange={formik.handleChange}
                placeholder="pilih bulan"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("bulan") && "p-invalid"}`}
              />
              {getErrorMessage("bulan")}
            </div>
            <div className={style["field-wrapper"]}>
              <label htmlFor="tahun">Tahun{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="tahun"
                name="tahun"
                options={optionTahun}
                value={formik.values.tahun}
                onChange={formik.handleChange}
                placeholder="pilih tahun"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("tahun") && "p-invalid"}`}
              />
              {getErrorMessage("tahun")}
            </div>
          </div>
          <Divider align="center" className={style["divider-margin-0"]}>
            <span className="divider">Keaktifan Mengikuti Kegiatan</span>
          </Divider>
          <div className={style["form-btn-wrapper"]}>
            <div className={style["field-wrapper"]}>
              <label htmlFor="keaktifan_olahraga">Olahraga{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="keaktifan_olahraga"
                name="keaktifan_olahraga"
                options={[{ value: 1 }, { value: 2 }, { value: 3 }]}
                value={formik.values.keaktifan_olahraga}
                onChange={formik.handleChange}
                optionLabel="value"
                placeholder="pilih nilai"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("keaktifan_olahraga") && "p-invalid"}`}
              />
              {getErrorMessage("keaktifan_olahraga")}
            </div>
            <div className={style["field-wrapper"]}>
              <label htmlFor="keaktifan_keagamaan">Keagamaan{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="keaktifan_keagamaan"
                name="keaktifan_keagamaan"
                options={[{ value: 1 }, { value: 5 }]}
                value={formik.values.keaktifan_keagamaan}
                onChange={formik.handleChange}
                optionLabel="value"
                placeholder="pilih nilai"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("keaktifan_keagamaan") && "p-invalid"}`}
              />
              {getErrorMessage("keaktifan_keagamaan")}
            </div>
            <div className={style["field-wrapper"]}>
              <label htmlFor="keaktifan_sharing_session">Sharing Session{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="keaktifan_sharing_session"
                name="keaktifan_sharing_session"
                options={[{ value: 1 }, { value: 5 }]}
                value={formik.values.keaktifan_sharing_session}
                onChange={formik.handleChange}
                optionLabel="value"
                placeholder="pilih nilai"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("keaktifan_sharing_session") && "p-invalid"}`}
              />
              {getErrorMessage("keaktifan_sharing_session")}
            </div>
          </div>
          <Divider align="center" className={style["divider-margin-0"]}>
            <span className="divider">Pengetahuan Terhadap Keadaan</span>
          </Divider>
          <div className={style["field-wrapper"]}>
            <label htmlFor="pengetahuan">Pengetahuan{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
            <Dropdown
              id="pengetahuan"
              name="pengetahuan"
              options={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }]}
              value={formik.values.pengetahuan}
              onChange={formik.handleChange}
              optionLabel="value"
              placeholder="pilih nilai"
              disabled={headerDialog.toLowerCase() === "details"}
              className={`${style["dropdown"]} ${isFieldError("pengetahuan") && "p-invalid"}`}
            />
            {getErrorMessage("pengetahuan")}
          </div>
          <Divider align="center" className={style["divider-margin-0"]}>
            <span className="divider">Implementasi Action</span>
          </Divider>
          <div className={style["form-btn-wrapper"]}>
            <div className={style["field-wrapper"]}>
              <label htmlFor="action_agility">Agility{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="action_agility"
                name="action_agility"
                options={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }]}
                value={formik.values.action_agility}
                onChange={formik.handleChange}
                optionLabel="value"
                placeholder="pilih nilai"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("action_agility") && "p-invalid"}`}
              />
              {getErrorMessage("action_agility")}
            </div>
            <div className={style["field-wrapper"]}>
              <label htmlFor="action_customer_centric">Customer Centric{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="action_customer_centric"
                name="action_customer_centric"
                options={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }]}
                value={formik.values.action_customer_centric}
                onChange={formik.handleChange}
                optionLabel="value"
                placeholder="pilih nilai"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("action_customer_centric") && "p-invalid"}`}
              />
              {getErrorMessage("action_customer_centric")}
            </div>
            <div className={style["field-wrapper"]}>
              <label htmlFor="action_innovation">Innovation{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="action_innovation"
                name="action_innovation"
                options={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }]}
                value={formik.values.action_innovation}
                onChange={formik.handleChange}
                optionLabel="value"
                placeholder="pilih nilai"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("action_innovation") && "p-invalid"}`}
              />
              {getErrorMessage("action_innovation")}
            </div>
          </div>
          <div className={style["form-btn-wrapper"]}>
            <div className={style["field-wrapper"]}>
              <label htmlFor="action_open_mindset">Open Mindset{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="action_open_mindset"
                name="action_open_mindset"
                options={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }]}
                value={formik.values.action_open_mindset}
                onChange={formik.handleChange}
                optionLabel="value"
                placeholder="pilih nilai"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("action_open_mindset") && "p-invalid"}`}
              />
              {getErrorMessage("action_open_mindset")}
            </div>
            <div className={style["field-wrapper"]}>
              <label htmlFor="action_networking">Networking{headerDialog.toLowerCase() !== "details" && <span className="required-dot">*</span>}</label>
              <Dropdown
                id="action_networking"
                name="action_networking"
                options={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }]}
                value={formik.values.action_networking}
                onChange={formik.handleChange}
                optionLabel="value"
                placeholder="pilih nilai"
                disabled={headerDialog.toLowerCase() === "details"}
                className={`${style["dropdown"]} ${isFieldError("action_networking") && "p-invalid"}`}
              />
              {getErrorMessage("action_networking")}
            </div>
          </div>
          <div className={style["form-btn-wrapper"]}>
            <Button
              type="button"
              secondary
              onClick={() => {
                setHeaderDialog("");
                setVisibleDialog(false);
                formik.resetForm();
              }}
            >
              {headerDialog.toLowerCase() !== "details" ? "Batal" : "Tutup"}
            </Button>
            {headerDialog.toLowerCase() !== "details" && <Button type="submit">{headerDialog.toLowerCase() !== "tambah" ? "Ubah" : "Simpan"}</Button>}
          </div>
        </form>
      </Dialog>
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
