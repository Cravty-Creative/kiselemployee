import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppContext } from "@/context";

// Style
import style from "./styles/sidebar.module.css";

export default function Sidebar({ visible, setVisible }) {
  const { menu, activePage: page } = useContext(AppContext);
  const REGEX = /[^\/]*/g;
  const activePage = `/${page.match(REGEX)[1]}`;
  return (
    <div className={`${style["sidebar"]} ${visible ? "" : style["hide"]}`}>
      <button
        className={style["toggle-sidebar"]}
        onClick={() => {
          setVisible((prev) => (prev ? false : true));
          localStorage.setItem("sidebar", visible ? "false" : "true");
        }}
      >
        <i className={`pi ${visible ? "pi-chevron-left" : "pi-chevron-right"}`}></i>
      </button>
      <div className={style["logo-telkomsel"]}>
        <Image src={visible ? "/logo_telkomsel.png" : "/logo_telkomsel_mini.png"} alt="logo telkomsel" fill sizes="33vw" />
      </div>
      <div className={style["menu-wrapper"]}>
        {(menu || []).map((item, index) => (
          <Link key={index} href={item.url} className={`${style["menu"]} ${activePage === item.url ? style["active"] : ""}`}>
            <i className={`${style["menu-icon"]} pi ${item.icon}`}></i>
            {visible && <span className={style["menu-title"]}>{item.nama}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
