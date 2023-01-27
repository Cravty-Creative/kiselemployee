import { useState } from "react";
import Sidebar from "./Sidebar";

// Style
import style from "./styles/content.module.css";

export default function Content({ children, menu, activeMenu, pageTitle }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <>
      <Sidebar visible={sidebarVisible} setVisible={setSidebarVisible} menu={menu} activeMenu={activeMenu} />
      <div className={style["content-wrapper"]}>
        <div className={style["content"]}>
          <h1>{pageTitle || ""}</h1>
          {children}
        </div>
      </div>
      <footer className={style["footer"]}>
        <span>Copyright PT. Koperasi Telekomunikasi Seluler</span>
        <span>Created by Arya</span>
      </footer>
    </>
  );
}
