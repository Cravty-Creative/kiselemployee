import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";
import * as serviceKaryawan from "@/services/karyawan.js";

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

// Style
import style from "@/styles/manajemen-user.module.css";

export default function ManajemenUser({ access_token, menu = [], activePage }) {
  const router = useRouter();
  const actionMenu = useRef(null);
  const toast = useRef(null);
  const breadcrumb = [{ label: "Manajemen User", url: activePage }];

  const [optionTipeKaryawan, setOptionTipeKaryawan] = useState([]);
  const [loadingTipeKaryawan, setLoadingTipeKaryawan] = useState(true);
  const [tipeKaryawan, setTipeKaryawan] = useState(null);
  const [search, setSearch] = useState("");
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
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
        router.push(`/manajemen-user/detail/${selectedRow.id}`);
      },
    },
    {
      label: "Edit",
      command: () => {
        router.push(`/manajemen-user/detail/${selectedRow.id}?edit=true`);
      },
    },
    {
      separator: true,
    },
    {
      label: "Delete",
    },
  ];

  // HTTP/API CALL
  const getTipeKaryawan = () => {
    setLoadingTipeKaryawan(true);
    serviceKaryawan
      .getTipeKaryawan(access_token.token)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Tipe Kayawan", detail: res.data.message, life: 3000 });
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

  const getAllKaryawan = () => {
    setLoadingTable(true);
    serviceKaryawan
      .getAllKaryawan(access_token.token, lazyParams.first, lazyParams.rows)
      .then((res) => {
        if (res.status !== 200) {
          toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Data Kayawan", detail: res.data.message, life: 3000 });
        } else {
          let dataTemp = (res.data.data || []).map((data, index) => {
            return {
              no: res.data.first + 1,
              id: data.emp_id || null,
              nama_lengkap: data.name || "-",
              username: data.username || "-",
              divisi: data.section || "-",
              jabatan: data.job_title || "-",
              spv: data.spv1_name || "-",
              ...data,
            };
          });

          setDataKaryawan(dataTemp);
          setTotalRecords(12);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setLoadingTable(false);
      });
  };

  const handleActionClick = (event, rowData) => {
    actionMenu.current.toggle(event);
    setSelectedRow(rowData);
  };

  // TEMPLATE
  const actionBodyTemplate = (rowData) => (
    <>
      <Menu model={menuItems} popup ref={actionMenu} id="action-menu" className={style["action-menu"]} />
      <button className={style["button-action"]} onClick={(e) => handleActionClick(e, rowData)}>
        <i className="pi pi-ellipsis-v"></i>
      </button>
    </>
  );

  useEffect(() => {
    getTipeKaryawan();
    getAllKaryawan();
  }, []);

  return (
    <>
      <PageHeader title="Manajemen User" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Manajemen User" secondaryTitle="View and manage all employee data here" breadcrumbItems={breadcrumb}>
          <div className={style["button-add-wrapper"]}>
            <Button onClick={() => router.push("/manajemen-user/tambah")}>Tambah User</Button>
          </div>
          <div className={style["search-wrapper"]}>
            <div className={style["tipe-karyawan-field-wrapper"]}>
              <label htmlFor="tipe-karyawan">Tipe Karyawan</label>
              <Dropdown
                id="tipe-karyawan"
                disabled={loadingTipeKaryawan}
                options={optionTipeKaryawan}
                value={tipeKaryawan}
                onChange={(e) => setTipeKaryawan(e.value)}
                placeholder="Tipe Karyawan"
                panelClassName={style["option-tipe-karyawan"]}
                className={style["dropdown-tipe-karyawan"]}
              />
            </div>
            <div className={style["search-field-wrapper"]}>
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className={`p-inputtext-sm ${style["search-field"]}`} />
              </span>
              <Button className={style["button-search"]}>
                <i className="pi pi-search"></i>
              </Button>
            </div>
          </div>
          <div className={style["table-wrapper"]}>
            <DataTable
              value={dataKaryawan}
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
              tableClassName={style["table-data-karyawan"]}
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
