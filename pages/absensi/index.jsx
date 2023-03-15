import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getDecrypt } from "@/services/encryptDecrypt";
import { AppContext } from "@/context";

// Components
import PageHeader from "@/components/PageHeader";
import Content from "@/components/Content";

// Style
import style from "@/styles/absensi-karyawan.module.css";

export default function Absensi({ access_token, menu = [], activePage }) {
  const router = useRouter();
  const breadcrumb = [{ label: "Absensi Karyawan", url: activePage }];

  return (
    <>
      <PageHeader title="Absensi Karyawan" />
      <AppContext.Provider value={{ accessToken: access_token, menu: menu, activePage: activePage }}>
        <Content pageTitle="Absensi Karyawan" secondaryTitle="presence your employees" breadcrumbItems={breadcrumb}>
          <span>coming soon</span>
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
