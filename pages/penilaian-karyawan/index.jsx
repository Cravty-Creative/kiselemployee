import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";
import * as serviceKaryawan from "@/services/karyawan.js";
import { LIST_BULAN, LIST_TAHUN } from "@/services/constants";

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

// Style
import style from "@/styles/penilaian-karyawan.module.css";

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
  const [section, setSection] = useState(null);
  const [optionSection, setOptionSection] = useState([]);
  const [loadingSection, setLoadingSection] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedRow, setSelectedRow] = useState(null);
  const [dataNilai, setDataNilai] = useState([]);
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
        router.push(`/penilaian-karyawan/detail/${selectedRow.id}`);
      },
    },
    {
      label: "Edit",
      command: () => {
        router.push(`/penilaian-karyawan/detail/${selectedRow.id}?edit=true`);
      },
    },
    {
      separator: true,
    },
    {
      label: "Delete",
      command: () => {
        setDeleteData(selectedRow);
        setVisibleDeleteDialog(true);
      },
    },
  ];

  const handleConfirmDialog = () => {};

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

  const getSection = () => {
    setLoadingSection(true);
    serviceKaryawan
      .getAllSection(access_token.token)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Section Karyawan", detail: res.data.message, life: 3000 });
        } else {
          let dataTemp = res.data.map((item) => ({ label: item.section, value: item.section }));
          setOptionSection(dataTemp);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setLoadingSection(false);
      });
  };

  const getAllPenilaian = () => {};

  const handleActionClick = (event, rowData) => {
    actionMenu.current.toggle(event);
    setSelectedRow(rowData);
  };

  // TEMPLATE
  const actionBodyTemplate = (rowData) => (
    <>
      <Menu model={menuItems} popup ref={actionMenu} id="action-menu" className={style["action-menu"]} onHide={() => setSelectedRow(null)} />
      <button className={style["button-action"]} onClick={(e) => handleActionClick(e, rowData)}>
        <i className="pi pi-ellipsis-v"></i>
      </button>
    </>
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
              <Button>Input Nilai Karyawan</Button>
            </div>
          </div>
          <div className={style["search-wrapper"]}>
            <div className={style["dropdown-wrapper"]}>
              <div className={style["field-wrapper"]}>
                <label htmlFor="tipe-karyawan">Tipe Karyawan</label>
                <Dropdown
                  id="tipe-karyawan"
                  disabled={loadingTipeKaryawan}
                  options={optionTipeKaryawan}
                  value={tipeKaryawan}
                  onChange={(e) => setTipeKaryawan(e.value)}
                  placeholder="Tipe Karyawan"
                  panelClassName={style["dropdown-option"]}
                  className={`${style["dropdown"]} ${style["tipe-karyawan"]}`}
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
            >
              <Column field="no" header="No" className={style["no-column"]}></Column>
              <Column field="nama_lengkap" header="Nama Lengkap"></Column>
              <Column field="username" header="Username"></Column>
              <Column field="divisi" header="Divisi"></Column>
              <Column field="jabatan" header="Jabatan"></Column>
              <Column field="spv" header="Nama SPV"></Column>
              <Column header="Action" className={style["action-column"]} body={actionBodyTemplate}></Column>
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
