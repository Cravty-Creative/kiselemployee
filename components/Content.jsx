import { useState } from "react";
import Sidebar from "./Sidebar";

// Components
import { BreadCrumb } from 'primereact/breadcrumb';

// Style
import style from "./styles/content.module.css";

export default function Content({ children, menu, activeMenu, pageTitle }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const breadcrumb = {
    home: { icon: 'pi pi-home', url: '/' },
    items: [{ label: pageTitle, url: '/', active: false }]
  }

  return (
    <div className={style['content']}>
      <Sidebar visible={sidebarVisible} setVisible={setSidebarVisible} menu={menu} activeMenu={activeMenu} />
      <div className={style["content-wrapper"]}>
        <nav className={style['navbar']}>
          {/* <h1 className={style['navbar-header']}>{pageTitle || ""}</h1> */}
          <BreadCrumb model={breadcrumb.items} home={breadcrumb.home} />
          <div className={style["acc-menu-wrapper"]}>
            menu
          </div>
        </nav>
        <div className={style["content"]}>
          {children}
        </div>
        <footer className={style["footer"]}>
          <span>Copyright PT. Koperasi Telekomunikasi Seluler</span>
          <span>Created by Arya</span>
        </footer>
      </div>
    </div>
  );
}
