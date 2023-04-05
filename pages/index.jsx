import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";

// Components
import PageHeader from "@/components/PageHeader";
import Content from "@/components/Content";
import { Button } from "primereact/button";

// Style
import style from "@/styles/dashboard.module.css";
import Link from "next/link";

export default function Home({ access_token, menu = [], activePage }) {
  const router = useRouter();
  const breadcrumb = [{ label: "Dashboard", url: activePage }];
  const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const [dataJumlah, setDataJumlah] = useState([
    {
      title: "Jumlah Karyawan",
      jumlah: 371,
      last_updated: "2023-04-02",
    },
    {
      title: "Jumlah Karyawan Inventory",
      jumlah: 72,
      last_updated: "2023-04-02",
    },
    {
      title: "Jumlah Karyawan Distributor",
      jumlah: 102,
      last_updated: "2023-04-02",
    },
  ]);

  const [dataRanking, setDataRanking] = useState([
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

  return (
    <>
      <PageHeader title="Dashboard" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Dashboard" secondaryTitle={`Welcome back! ${access_token.name}`} breadcrumbItems={breadcrumb}>
          <div className={style["section-1-wrapper"]}>
            {(dataJumlah || []).map((item, i) => (
              <div key={i} className={style["list-section-1"]}>
                <span className={style["title"]}>{item.title ?? ""}</span>
                <span className={style["jumlah"]}>{item.jumlah ?? ""}</span>
                <span className={style["last-updated"]}>last updated at {item.last_updated && new Date(item.last_updated).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <h1 className={style["header-ranking"]}>
            Karyawan Terbaik Bulan {bulan[new Date().getMonth() - 1]}
            <Link href="/ranking">
              <i className="pi pi-external-link"></i>
            </Link>
          </h1>
          <div className={style["ranking-wrapper"]}>
            {dataRanking.length ? (
              dataRanking.map((item, index) => (
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
                  </div>
                </div>
              ))
            ) : (
              <div>Tidak Ada Data</div>
            )}
          </div>
        </Content>
      </AppContext.Provider>
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
