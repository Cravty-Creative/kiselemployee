import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";
import * as serviceKaryawan from "@/services/karyawan.js";

// Components
import PageHeader from "@/components/PageHeader";
import Content from "@/components/Content";
import { Skeleton } from "primereact/skeleton";

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
      jumlah: 0,
      last_updated: "",
    },
    {
      title: "Jumlah Karyawan Inventory",
      jumlah: 0,
      last_updated: "",
    },
    {
      title: "Jumlah Karyawan Distribution",
      jumlah: 0,
      last_updated: "",
    },
  ]);

  const [dataRanking, setDataRanking] = useState([]);

  // HTTP/API CALL
  const getUserCount = () => {
    serviceKaryawan.getUserCount(access_token.token).then((res) => {
      if (res.status === 200) {
        setDataJumlah(res.data.data);
      }
    });
  };

  const getRanking = () => {
    let params = {
      periode: `${new Date().getMonth()}/${new Date().getFullYear()}`,
      tipe_karyawan: "",
      user_id: "",
      limit: 5,
    };

    serviceKaryawan.getRanking(access_token.token, params).then((res) => {
      if (res.status === 200) {
        let tempRank = [];
        for (const key of Object.keys(res.data.ranking)) {
          tempRank = [...tempRank, ...res.data.ranking[key]];
        }
        tempRank.sort((a, b) => b.nilai - a.nilai);
        setDataRanking(tempRank);
      }
    });
  };

  useEffect(() => {
    getUserCount();
    getRanking();
  }, []);

  return (
    <>
      <PageHeader title="Dashboard" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Dashboard" secondaryTitle={`Welcome back! ${access_token.name}`} breadcrumbItems={breadcrumb}>
          <div className={style["section-1-wrapper"]}>
            {(dataJumlah || []).map((item, i) => (
              <div key={i} className={style["list-section-1"]}>
                <span className={style["title"]}>{item.title ?? ""}</span>
                <span className={style["jumlah"]}>{item.jumlah || item.jumlah !== 0 ? item.jumlah : <Skeleton width="5rem" height="3rem" />}</span>
                <span className={style["last-updated"]}>last updated at {item.last_updated ? item.last_updated : <Skeleton width="7rem" height="1rem" />}</span>
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
