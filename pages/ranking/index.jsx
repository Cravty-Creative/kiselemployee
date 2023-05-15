import { useState, useEffect, useRef } from "react";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";
import * as serviceKaryawan from "@/services/karyawan.js";
import JsPDF from "jspdf";

// Components
import PageHeader from "@/components/PageHeader";
import Content from "@/components/Content";
import Button from "@/components/Button";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { TabMenu } from "primereact/tabmenu";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

// Style
import style from "@/styles/rangking-karyawan.module.css";
import Loading from "@/components/Loading";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { classNames } from "primereact/utils";

export default function Ranking({ access_token, menu = [], activePage }) {
  const breadcrumb = [{ label: "Rangking Karyawan", url: activePage }];
  const toast = useRef(null);

  // Filter
  const [periodeBulan, setPeriodeBulan] = useState(new Date(`${new Date().getFullYear()}/${new Date().getMonth()}/01`));
  const [loadingOptionTipe, setLoadingOptionTipe] = useState(false);
  const [optionTipe, setOptionTipe] = useState([]);
  const [tipe, setTipe] = useState("all");
  const [limit, setLimit] = useState(10);

  const [visibleDialog, setVisibleDialog] = useState(false);
  const [dialogMaximize, setDialogMaximize] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [visiblePdf, setVisiblePdf] = useState(false);
  const [triggerVisiblePdf, setTriggerVisiblePdf] = useState(false);

  const [userName, setUserName] = useState(null);
  const [dataKriteria, setDataKriteria] = useState({});
  const [dataBobotKriteria, setDataBobotKriteria] = useState([]);
  const [dataPenentuanSkor, setDataPenentuanSkor] = useState([]);
  const [dataPoinMatriksInventory, setDataPoinMatriksInventory] = useState([]);
  const [dataPoinMatriksDistribution, setDataPoinMatriksDistribution] = useState([]);
  const [dataNormalisasiMatriksInventory, setDataNormalisasiMatriksInventory] = useState([]);
  const [dataNormalisasiMatriksDistribution, setDataNormalisasiMatriksDistribution] = useState([]);
  const [dataPerhitunganAkhirInventory, setDataPerhitunganAkhirInventory] = useState([]);
  const [dataPerhitunganAkhirDistribution, setDataPerhitunganAkhirDistribution] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const tabItems = [{ label: "Data Kriteria" }, { label: "Data Bobot" }, { label: "Penentuan Skor" }, { label: "Poin Matriks" }, { label: "Normalisasi Matriks" }, { label: "Perhitungan Akhir" }];

  const capitalizeLetter = (str, separator = " ") => {
    const arr = str.split(separator);
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join(" ");
  };

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

  const getRanking = (user_id = null) => {
    setLoadingPage(true);

    let params = {
      periode: `${(new Date(periodeBulan).getMonth() + 1).toLocaleString("en-us", { minimumIntegerDigits: 2 })}/${new Date(periodeBulan).getFullYear()}`,
      tipe_karyawan: tipe !== "all" ? tipe : "",
      user_id: user_id ?? null,
      limit: limit,
    };

    serviceKaryawan
      .getRanking(access_token.token, params)
      .then((res) => {
        if (res.status !== 200) {
          setDataKriteria({});
          setDataBobotKriteria([]);
          setDataPoinMatriksInventory([]);
          setDataPoinMatriksDistribution([]);
          setDataNormalisasiMatriksInventory([]);
          setDataNormalisasiMatriksDistribution([]);
          setDataPerhitunganAkhirInventory([]);
          setDataPerhitunganAkhirDistribution([]);
          setRanking([]);
          toast.current.show({ severity: "warn", summary: "Gagal", detail: res.data.message, life: 3000 });
        } else {
          setDataKriteria(res.data.kriteria);
          setDataPenentuanSkor(res.data.penentuan_skor);
          setDataPoinMatriksInventory(res.data.poin_matriks.inventory || []);
          setDataPoinMatriksDistribution(res.data.poin_matriks.distribution || []);

          let dataTempBobot = [];
          Object.keys(res.data.bobot_kriteria).map((key, index) => {
            dataTempBobot.push({
              no: index + 1,
              nama: capitalizeLetter(key, "_"),
              ...res.data.bobot_kriteria[key],
            });
          });
          setDataBobotKriteria(dataTempBobot);

          for (const key of Object.keys(res.data.normalisasi_matriks)) {
            let temp = [];

            (res.data.normalisasi_matriks[key] || []).map((item) => {
              for (const data of item.data) {
                temp.push({
                  user_id: item.user_id,
                  name: item.name,
                  tipe_kriteria: "Benefit",
                  rumus: "xij/nilai max",
                  ...data,
                });
              }
            });

            if (key === "inventory") {
              setDataNormalisasiMatriksInventory(temp);
            } else {
              setDataNormalisasiMatriksDistribution(temp);
            }
          }

          for (const key of Object.keys(res.data.perhitungan_akhir)) {
            let temp = [];

            (res.data.perhitungan_akhir[key] || []).map((item) => {
              for (const data of item.data) {
                temp.push({
                  user_id: item.user_id,
                  name: item.name,
                  hasil: item.hasil,
                  ...data,
                });
              }
            });

            if (key === "inventory") {
              setDataPerhitunganAkhirInventory(temp);
            } else {
              setDataPerhitunganAkhirDistribution(temp);
            }
          }

          let tempRank = [];
          for (const key of Object.keys(res.data.ranking)) {
            tempRank = [...tempRank, ...res.data.ranking[key]];
          }
          tempRank.sort((a, b) => b.nilai - a.nilai);
          setRanking(tempRank);
        }
      })
      .catch((error) => {
        toast.current.show({ severity: "error", summary: "Sistem Error", detail: error.response, life: 3000 });
      })
      .finally(() => {
        setLoadingPage(false);
      });
  };

  const generatePDF = () => {
    if (ranking.length < 1) return;
    setVisiblePdf(true);
    const report = new JsPDF("portrait", "pt", "a4");
    report.html(document.querySelector("#ranking-data")).then(() => {
      report.save(
        `Ranking Data ${new Date().toLocaleString("id", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}.pdf`
      );
      setTriggerVisiblePdf((prev) => (prev ? false : true));
    });
  };

  // TEMPLATE
  const dataKriteriaTemplate = (
    <div className={style["container-detail"]}>
      {(Object.keys(dataKriteria) || []).map((key) => (
        <div className={style["kriteria-detail-wrapper"]} key={key}>
          <h4>{capitalizeLetter(key, "_")}</h4>
          <div className={style["grid-cols-2"]}>
            {(Object.keys(dataKriteria[key]) || []).map((item) => (
              <div key={item}>
                <h5 className={style["col-span-1"]} style={{ marginBottom: ".5rem" }}>
                  {capitalizeLetter(item, "_")}
                </h5>
                <DataTable value={dataKriteria[key][item]} showGridlines size="small">
                  <Column field="name" header="Nama" />
                  <Column field="score" header="Skor" style={{ width: "5%" }} />
                </DataTable>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const dataBobotTemplate = (
    <div className={style["container-detail"]}>
      <h4 style={{ marginBottom: ".5rem" }}>Data Bobot</h4>
      <DataTable value={dataBobotKriteria} showGridlines size="small">
        <Column field="nama" header="Nama" />
        <Column field="max" header="Nilai Max" />
        <Column field="bobot" header="Bobot" style={{ width: "5%" }} />
      </DataTable>
    </div>
  );

  const penentuanSkorTemplate = (
    <div className={style["container-detail"]}>
      <h4 style={{ marginBottom: ".5rem" }}>Penentuan Skor</h4>
      <DataTable value={userName ? dataPenentuanSkor.filter((v) => v.name === userName) : dataPenentuanSkor} showGridlines size="small">
        <Column field="name" header="Nama" />
        <Column field="type_id" header="Tipe Karyawan" />
        <Column field="c1" header="C1" style={{ width: "5%" }} />
        <Column field="c2" header="C2" style={{ width: "5%" }} />
        <Column field="c3" header="C3" style={{ width: "5%" }} />
        <Column field="c4" header="C4" style={{ width: "5%" }} />
        <Column field="c5" header="C5" style={{ width: "5%" }} />
        <Column field="c6" header="C6" style={{ width: "5%" }} />
        <Column field="c7" header="C7" style={{ width: "5%" }} />
        <Column field="c8" header="C8" style={{ width: "5%" }} />
        <Column field="c9" header="C9" style={{ width: "5%" }} />
        <Column field="c10" header="C10" style={{ width: "5%" }} />
        <Column field="c11" header="C11" style={{ width: "5%" }} />
      </DataTable>
    </div>
  );

  const poinMatriksGroup = (
    <ColumnGroup>
      <Row>
        <Column header="Nama Karyawan" rowSpan={2} />
        <Column header="Xij" colSpan={11} />
      </Row>
      <Row>
        <Column header="C1" />
        <Column header="C2" />
        <Column header="C3" />
        <Column header="C4" />
        <Column header="C5" />
        <Column header="C6" />
        <Column header="C7" />
        <Column header="C8" />
        <Column header="C9" />
        <Column header="C10" />
        <Column header="C11" />
      </Row>
    </ColumnGroup>
  );

  const poinMatriksTemplate = (
    <div className={style["container-detail"]}>
      <h4 style={{ marginBottom: ".5rem" }}>Poin Matriks</h4>
      {(userName ? dataPoinMatriksInventory.filter((v) => v.name === userName) : dataPoinMatriksInventory).length > 0 ? (
        <div className={style["poin-matriks-wrapper"]}>
          <h5>Bagian Inventory</h5>
          <DataTable value={userName ? dataPoinMatriksInventory.filter((v) => v.name === userName) : dataPoinMatriksInventory} showGridlines size="small" headerColumnGroup={poinMatriksGroup}>
            <Column field="name" header="Nama" />
            <Column field="c1" header="C1" style={{ width: "5%" }} />
            <Column field="c2" header="C2" style={{ width: "5%" }} />
            <Column field="c3" header="C3" style={{ width: "5%" }} />
            <Column field="c4" header="C4" style={{ width: "5%" }} />
            <Column field="c5" header="C5" style={{ width: "5%" }} />
            <Column field="c6" header="C6" style={{ width: "5%" }} />
            <Column field="c7" header="C7" style={{ width: "5%" }} />
            <Column field="c8" header="C8" style={{ width: "5%" }} />
            <Column field="c9" header="C9" style={{ width: "5%" }} />
            <Column field="c10" header="C10" style={{ width: "5%" }} />
            <Column field="c11" header="C11" style={{ width: "5%" }} />
          </DataTable>
        </div>
      ) : (
        ""
      )}
      {(userName ? dataPoinMatriksDistribution.filter((v) => v.name === userName) : dataPoinMatriksDistribution).length > 0 ? (
        <div className={style["poin-matriks-wrapper"]}>
          <h5>Bagian Distribution</h5>
          <DataTable value={userName ? dataPoinMatriksDistribution.filter((v) => v.name === userName) : dataPoinMatriksDistribution} showGridlines size="small" headerColumnGroup={poinMatriksGroup}>
            <Column field="name" header="Nama" />
            <Column field="c1" header="C1" style={{ width: "5%" }} />
            <Column field="c2" header="C2" style={{ width: "5%" }} />
            <Column field="c3" header="C3" style={{ width: "5%" }} />
            <Column field="c4" header="C4" style={{ width: "5%" }} />
            <Column field="c5" header="C5" style={{ width: "5%" }} />
            <Column field="c6" header="C6" style={{ width: "5%" }} />
            <Column field="c7" header="C7" style={{ width: "5%" }} />
            <Column field="c8" header="C8" style={{ width: "5%" }} />
            <Column field="c9" header="C9" style={{ width: "5%" }} />
            <Column field="c10" header="C10" style={{ width: "5%" }} />
            <Column field="c11" header="C11" style={{ width: "5%" }} />
          </DataTable>
        </div>
      ) : (
        ""
      )}
    </div>
  );

  const normalisasiMatriksTemplate = (
    <div className={style["container-detail"]}>
      <h4 style={{ marginBottom: ".5rem" }}>Normalisasi Matriks</h4>
      {(userName ? dataNormalisasiMatriksInventory.filter((v) => v.name === userName) : dataNormalisasiMatriksInventory).length > 0 ? (
        <div className={style["poin-matriks-wrapper"]}>
          <h5>Bagian Inventory</h5>
          <DataTable
            value={userName ? dataNormalisasiMatriksInventory.filter((v) => v.name === userName) : dataNormalisasiMatriksInventory}
            showGridlines
            size="small"
            rowGroupMode="rowspan"
            groupRowsBy="name"
            sortMode="single"
            sortField="name"
            sortOrder={1}
          >
            <Column field="name" header="Nama" />
            <Column field="kode_kriteria" header="Kode Kriteria" />
            <Column field="tipe_kriteria" header="Tipe Kriteria" />
            <Column field="xij" header="Xij" />
            <Column field="max" header="Nilai Max" />
            <Column field="rumus" header="Rumus" />
            <Column field="rij" header="Hasil (rij)" />
          </DataTable>
        </div>
      ) : (
        ""
      )}
      {(userName ? dataNormalisasiMatriksDistribution.filter((v) => v.name === userName) : dataNormalisasiMatriksDistribution).length > 0 ? (
        <div className={style["poin-matriks-wrapper"]}>
          <h5>Bagian Distribution</h5>
          <DataTable
            value={userName ? dataNormalisasiMatriksDistribution.filter((v) => v.name === userName) : dataNormalisasiMatriksDistribution}
            showGridlines
            size="small"
            rowGroupMode="rowspan"
            groupRowsBy="name"
            sortMode="single"
            sortField="name"
            sortOrder={1}
          >
            <Column field="name" header="Nama" />
            <Column field="kode_kriteria" header="Kode Kriteria" />
            <Column field="tipe_kriteria" header="Tipe Kriteria" />
            <Column field="xij" header="Xij" />
            <Column field="max" header="Nilai Max" />
            <Column field="rumus" header="Rumus" />
            <Column field="rij" header="Hasil (rij)" />
          </DataTable>
        </div>
      ) : (
        ""
      )}
    </div>
  );

  const PerhitunganAkhirTemplate = (
    <div className={style["container-detail"]}>
      <h4 style={{ marginBottom: ".5rem" }}>Perhitungan Akhir</h4>
      {(userName ? dataPerhitunganAkhirInventory.filter((v) => v.name === userName) : dataPerhitunganAkhirInventory).length > 0 ? (
        <div className={style["poin-matriks-wrapper"]}>
          <h5>Bagian Inventory</h5>
          <DataTable
            value={userName ? dataPerhitunganAkhirInventory.filter((v) => v.name === userName) : dataPerhitunganAkhirInventory}
            showGridlines
            size="small"
            rowGroupMode="rowspan"
            groupRowsBy="user_id"
            sortMode="single"
            sortField="user_id"
            sortOrder={1}
          >
            <Column field="user_id" header="Nama" body={(e) => e.name} />
            <Column field="nama_bobot" header="Nama Bobot" />
            <Column field="nilai_bobot" header="Nilai Bobot" />
            <Column field="rumus" header="Rumus Nilai (rij)" />
            <Column field="isi_rumus" header="Isi Rumus" />
            <Column field="nilai_rumus" header="Nilai Rumus (rij)" />
            <Column field="nilai_x_bobot" header="Nilai rij x Nilai Bobot (R)" />
            <Column field="user_id" header="Hasil (R1 + R2 + ...RN)" body={(e) => e.hasil} />
          </DataTable>
        </div>
      ) : (
        ""
      )}
      {(userName ? dataPerhitunganAkhirDistribution.filter((v) => v.name === userName) : dataPerhitunganAkhirDistribution).length > 0 ? (
        <div className={style["poin-matriks-wrapper"]}>
          <h5>Bagian Distribution</h5>
          <DataTable
            value={userName ? dataPerhitunganAkhirDistribution.filter((v) => v.name === userName) : dataPerhitunganAkhirDistribution}
            showGridlines
            size="small"
            rowGroupMode="rowspan"
            groupRowsBy="user_id"
            sortMode="single"
            sortField="user_id"
            sortOrder={1}
          >
            <Column field="user_id" header="Nama" body={(e) => e.name} />
            <Column field="nama_bobot" header="Nama Bobot" />
            <Column field="nilai_bobot" header="Nilai Bobot" />
            <Column field="rumus" header="Rumus Nilai (rij)" />
            <Column field="isi_rumus" header="Isi Rumus" />
            <Column field="nilai_rumus" header="Nilai Rumus (rij)" />
            <Column field="nilai_x_bobot" header="Nilai rij x Nilai Bobot (R)" />
            <Column field="user_id" header="Hasil (R1 + R2 + ...RN)" body={(e) => e.hasil} />
          </DataTable>
        </div>
      ) : (
        ""
      )}
    </div>
  );

  const selectorTemplate = {
    0: dataKriteriaTemplate,
    1: dataBobotTemplate,
    2: penentuanSkorTemplate,
    3: poinMatriksTemplate,
    4: normalisasiMatriksTemplate,
    5: PerhitunganAkhirTemplate,
  };

  useEffect(() => {
    getTipeKaryawan();
    getRanking();
  }, []);

  useEffect(() => {
    setVisiblePdf(false);
  }, [triggerVisiblePdf]);

  return (
    <>
      <PageHeader title="Rangking Karyawan" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Rangking Karyawan" secondaryTitle="See who is the best of all your employees" breadcrumbItems={breadcrumb}>
          <div className={style["button-tab"]}>
            <Button
              onClick={() => {
                generatePDF();
              }}
            >
              Export Ranking
            </Button>
          </div>
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
                  { label: 5, value: 5 },
                  { label: 10, value: 10 },
                  { label: 20, value: 20 },
                  { label: 30, value: 30 },
                  { label: 40, value: 40 },
                  { label: "All", value: -1 },
                ]}
                value={limit}
                onChange={(e) => setLimit(e.value)}
                placeholder="limit"
                panelClassName={style["dropdown-option"]}
                className={`${style["dropdown"]} ${style["limit"]}`}
              />
            </div>
            <Button
              onClick={() => {
                getRanking();
              }}
              className={style["btn-tentukan"]}
            >
              Tentukan
            </Button>
          </div>
          <div className={style["title-ranking"]}>
            Berikut Ranking Karyawan pada {periodeBulan.toLocaleDateString("en-us", { month: "2-digit", year: "numeric" })}
            {ranking.length ? (
              <Button
                onClick={() => {
                  setVisibleDialog(true);
                }}
              >
                Lihat Detail Perhitungan
              </Button>
            ) : (
              ""
            )}
          </div>
          <div className={style["ranking-wrapper"]}>
            {ranking.length ? (
              ranking.map((item, index) => (
                <div key={index} className={style["list-ranking"]} ranking={index + 1}>
                  <div className={style["title-wrapper"]}>
                    <span className={style["ranking-no"]}>{index + 1}</span>
                    <div className={style["title1"]}>
                      <span className={style["ranking-nama"]}>{item.name}</span>
                      <span className={style["ranking-job"]}>
                        {item.job_title} - {item.work_location}
                      </span>
                    </div>
                    <span className={`${style["title2"]} ${item.type_id === "Distribution" ? style["secondary"] : ""}`}>{item.type_id}</span>
                  </div>
                  <div className={style["title-wrapper"]}>
                    <div className={style["title1"]}>
                      <span className={style["nilai-title"]}>Nilai</span>
                      <span className={style["ranking-nilai"]}>{item.nilai}</span>
                    </div>
                    <Button
                      className={style["ranking-btn"]}
                      onClick={() => {
                        setUserName(item.name);
                        setVisibleDialog(true);
                      }}
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className={style["no-data"]}>Tidak Ada Data</div>
            )}
          </div>
          <div id="ranking-data" className={classNames(`pdf ${style["pdf-ranking-wrapper"]}`, { hidden: !visiblePdf })}>
            <div className={style["header-pdf"]}>Ranking Karyawan pada {periodeBulan.toLocaleDateString("en-us", { month: "2-digit", year: "numeric" })}</div>
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
                    { label: 5, value: 5 },
                    { label: 10, value: 10 },
                    { label: 20, value: 20 },
                    { label: 30, value: 30 },
                    { label: 40, value: 40 },
                    { label: "All", value: -1 },
                  ]}
                  value={limit}
                  onChange={(e) => setLimit(e.value)}
                  placeholder="limit"
                  panelClassName={style["dropdown-option"]}
                  className={`${style["dropdown"]} ${style["limit"]}`}
                />
              </div>
            </div>
            {ranking.length ? (
              ranking.map((item, index) => (
                <div key={index} className={style["list-ranking"]} ranking={index + 1}>
                  <div className={style["title-wrapper"]}>
                    <span className={style["ranking-no"]}>{index + 1}</span>
                    <div className={style["title1"]}>
                      <span className={style["ranking-nama"]}>{item.name}</span>
                      <span className={style["ranking-job"]}>
                        {item.job_title} - {item.work_location}
                      </span>
                    </div>
                    <span className={`${style["title2"]} ${item.type_id === "Distribution" ? style["secondary"] : ""}`}>{item.type_id}</span>
                  </div>
                  <div className={style["title-wrapper"]}>
                    <div className={style["title1"]}>
                      <span className={style["nilai-title"]}>Nilai</span>
                      <span className={style["ranking-nilai"]}>{item.nilai}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={style["no-data"]}>Tidak Ada Data</div>
            )}
          </div>
        </Content>
        <Dialog
          header="Detail Perhitungan"
          visible={visibleDialog}
          style={{ width: "90vw", height: "90vh" }}
          onHide={() => {
            setVisibleDialog(false);
            setActiveIndex(0);
            setUserName(null);
          }}
          breakpoints={{ "960px": "100vw" }}
          maximizable
          maximized={dialogMaximize}
          onMaximize={(e) => setDialogMaximize(e.maximized)}
        >
          <TabMenu model={tabItems} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
          {selectorTemplate[activeIndex]}
        </Dialog>
      </AppContext.Provider>
      <Toast ref={toast} />
      <Loading visible={loadingPage} />
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
