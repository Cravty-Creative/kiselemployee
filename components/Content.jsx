import { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "@/context";
import { useRouter } from "next/router";

// Components
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";
import { Menu } from "primereact/menu";

// Style
import style from "./styles/content.module.css";

// Font
import { Inter } from "@next/font/google";
import { logout } from "@/services/auth";
const inter = Inter({ subsets: ["latin"] });

export default function Content({ children, pageTitle = "", secondaryTitle = "", breadcrumbItems, altHeader }) {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { accessToken, activePage } = useContext(AppContext);
  const menu = useRef(null);
  const breadcrumb = {
    home: { icon: "pi pi-home", url: "/" },
    items: breadcrumbItems,
  };
  const menuItems = [
    {
      label: "Profile",
      url: "/profile",
    },
    {
      label: "Settings",
      url: "/settings",
    },
    {
      separator: true,
    },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: async () => {
        await logout();
        router.reload();
      },
    },
  ];

  return (
    <div className={`${style["content"]}`}>
      <Sidebar visible={sidebarVisible} setVisible={setSidebarVisible} />
      <div className={`${style["content-wrapper"]} ${sidebarVisible ? "" : style["full"]}`}>
        <nav className={style["navbar"]}>
          <Breadcrumbs activePage={activePage} home={breadcrumb.home} items={breadcrumb.items} />
          <Menu model={menuItems} popup ref={menu} id="acc_menu" />
          <button className={`${style["acc-menu-wrapper"]}`} onClick={(e) => menu.current.toggle(e)}>
            <div className={style["acc-photo"]}>
              <i className="pi pi-user"></i>
            </div>
            <div className={`${style["acc-detail"]} ${inter.className}`}>
              <span className={style["acc-name"]}>{accessToken?.name}</span>
              <span className={style["acc-job"]}>{accessToken?.job_title}</span>
            </div>
            <i className="pi pi-angle-down"></i>
          </button>
        </nav>
        <div className={style["content-data"]}>
          <div className={style["header-wrapper"]}>
            <header>
              <h1 className={style["page-title"]}>{pageTitle}</h1>
              <h3 className={style["secondary-title"]}>{secondaryTitle}</h3>
            </header>
            {altHeader && <div className={style["alternative-header"]}>{altHeader}</div>}
          </div>
          <div className={style["data"]}>{children}</div>
        </div>
        <footer className={style["footer"]}>
          <div className={style["footer-body"]}>
            <span>Copyright PT. Koperasi Telekomunikasi Seluler</span>
            <span>Created by Arya with Liquora UI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
