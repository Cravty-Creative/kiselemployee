import { useState, useEffect, useRef } from "react";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";
import * as serviceKaryawan from "@/services/karyawan.js";

// Components
import PageHeader from "@/components/PageHeader";
import Content from "@/components/Content";
import Button from "@/components/Button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";

// Style
import style from "@/styles/rangking-karyawan.module.css";

export default function TambahUser({ access_token, menu = [], activePage }) {
  const breadcrumb = [{ label: "Rangking Karyawan", url: activePage }];
  const toast = useRef(null);

  // Filter
  const [periodeBulan, setPeriodeBulan] = useState(new Date());
  const [loadingOptionTipe, setLoadingOptionTipe] = useState(false);
  const [optionTipe, setOptionTipe] = useState([]);
  const [tipe, setTipe] = useState("all");
  const [limit, setLimit] = useState(10);

  const [visibleDialog, setVisibleDialog] = useState(false);
  const [dialogMaximize, setDialogMaximize] = useState(false);

  const [rawData, setRawData] = useState(null);
  const [ranking, setRanking] = useState([
    {
      no: 1,
      user_id: 2,
      nama: "Aurelien",
      tipe_karyawan: "Inventory",
      job_title: "Programmer",
      work_location: "Jakarta",
      nilai: "0.886",
    },
    {
      no: 2,
      user_id: 3,
      nama: "Alfiansyah",
      tipe_karyawan: "Distributor",
      job_title: "Admin Gudang",
      work_location: "Bekasi",
      nilai: "0.775",
    },
  ]);

  // HTTP/API CALL
  const getTipeKaryawan = () => {
    if (optionTipe.length < 1) {
      setLoadingOptionTipe(true);
      serviceKaryawan
        .getTipeKaryawan(access_token.token)
        .then((res) => {
          if (res.status !== 200) {
            toast.current.show({ severity: "warn", summary: "Gagal Mendapatkan Tipe Karyawan", detail: res.data.message, life: 3000 });
          } else {
            setOptionTipe(res.data);
          }
        })
        .catch((error) => {
          toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
        })
        .finally(() => {
          setLoadingOptionTipe(false);
        });
    }
  };

  useEffect(() => {
    getTipeKaryawan();
  });

  return (
    <>
      <PageHeader title="Rangking Karyawan" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Rangking Karyawan" secondaryTitle="See who is the best of all your employees" breadcrumbItems={breadcrumb}>
          <div className={style["search-wrapper"]}>
            <div className={style["field-wrapper"]}>
              <label htmlFor="periode_bulan">Periode Bulan</label>
              <Calendar
                id="periode_bulan"
                view="month"
                dateFormat="mm/yy"
                panelClassName={style["dropdown-option"]}
                className={`${style["dropdown"]} ${style["periode-bulan"]}`}
                value={periodeBulan}
                onChange={(e) => {
                  setPeriodeBulan(e.value);
                }}
              />
            </div>
            <div className={style["field-wrapper"]}>
              <label htmlFor="tipe_karyawan">Tipe Karyawan</label>
              <Dropdown
                id="tipe_karyawan"
                disabled={loadingOptionTipe}
                options={[...optionTipe, { id: "all", name: "All" }]}
                value={tipe}
                onChange={(e) => setTipe(e.value)}
                optionLabel="name"
                optionValue="id"
                placeholder="tipe karyawan"
                panelClassName={style["dropdown-option"]}
                className={`${style["dropdown"]} ${style["tipe-karyawan"]}`}
              />
            </div>
            <div className={style["field-wrapper"]}>
              <label htmlFor="limit">Limit</label>
              <Dropdown
                id="limit"
                options={[
                  { label: 10, value: 10 },
                  { label: 20, value: 20 },
                  { label: 30, value: 30 },
                  { label: 40, value: 40 },
                  { label: "All", value: null },
                ]}
                value={limit}
                onChange={(e) => setLimit(e.value)}
                placeholder="limit"
                panelClassName={style["dropdown-option"]}
                className={`${style["dropdown"]} ${style["limit"]}`}
              />
            </div>
            <Button onClick={() => { }} className={style["btn-tentukan"]}>
              Tentukan
            </Button>
          </div>
          <div className={style["title-ranking"]}>
            Berikut Ranking Karyawan pada {periodeBulan.toLocaleDateString("en-us", { month: "2-digit", year: "2-digit" })}
            <Button
              onClick={() => {
                setVisibleDialog(true);
              }}
            >
              Lihat Detail Perhitungan
            </Button>
          </div>
          <div className={style["ranking-wrapper"]}>
            {ranking.length ? (
              ranking.map((item, index) => (
                <div key={index} className={style["list-ranking"]}>
                  <div className={style["title-wrapper"]}>
                    <span className={style["ranking-no"]}>{item.no}</span>
                    <div className={style["title1"]}>
                      <span className={style["ranking-nama"]}>{item.nama}</span>
                      <span className={style["ranking-job"]}>
                        {item.job_title} - {item.work_location}
                      </span>
                    </div>
                    <span className={`${style["title2"]} ${item.tipe_karyawan === "Distributor" ? style["secondary"] : ""}`}>{item.tipe_karyawan}</span>
                  </div>
                  <div className={style["title-wrapper"]}>
                    <div className={style["title1"]}>
                      <span className={style["nilai-title"]}>Nilai</span>
                      <span className={style["ranking-nilai"]}>{item.nilai}</span>
                    </div>
                    <Button
                      className={style["ranking-btn"]}
                      onClick={() => {
                        setVisibleDialog(true);
                      }}
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div>Tidak Ada Data</div>
            )}
          </div>
        </Content>
        <Dialog
          header="Detail Perhitungan"
          visible={visibleDialog}
          style={{ width: "90vw", height: "90vh" }}
          onHide={() => setVisibleDialog(false)}
          breakpoints={{ "960px": "100vw" }}
          maximizable
          maximized={dialogMaximize}
          onMaximize={(e) => setDialogMaximize(e.maximized)}
        >
          Detail Perhitungan
        </Dialog>
      </AppContext.Provider>
      <Toast ref={toast} />
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
