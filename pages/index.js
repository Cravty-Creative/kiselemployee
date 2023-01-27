import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getDecrypt } from "@/services/encryptDecrypt";

// Components
import PageHeader from "@/components/PageHeader";
import Content from "@/components/Content";
import { Button } from "primereact/button";

// Service
import { logout } from "@/services/auth";

// Style
import style from "@/styles/dashboard.module.css";

// Font
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const [listMenu, setListMenu] = useState([]);

  useEffect(() => {
    setListMenu(JSON.parse(getDecrypt(localStorage.getItem("menu"))));
  }, []);
  return (
    <>
      <PageHeader title="Dashboard" />
      <div className={inter.className}>
        <Content activeMenu="/" pageTitle="Dashboard" menu={listMenu}>

          {/* <Button
            label="Logout"
            onClick={async () => {
              await logout();
              router.reload();
            }}
          /> */}
        </Content>
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  // console.log(window.localStorage.getItem("menu"));
  return {
    props: {},
  };
}
