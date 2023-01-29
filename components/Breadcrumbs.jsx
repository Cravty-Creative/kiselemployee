import Link from "next/link";

// Style
import style from "./styles/breadcrumbs.module.css";

export default function Breadcrumbs({ activePage, home = { icon: "pi pi-home", url: "/" }, items = [] }) {
  return (
    <div className={style["breadcrumb"]}>
      <Link href={home.url} className={`${style["item"]}`}>
        <i className={home.icon}></i>
      </Link>
      {(items || []).map((item, index) => (
        <div key={index}>
          <i className={`pi pi-angle-right ${style["arrow"]}`}></i>
          <Link href={item.url} className={`${style["item"]} ${activePage === item.url ? style["active"] : ""}`}>
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
