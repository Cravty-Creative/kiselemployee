import Link from "next/link";
import Image from "next/image";

// Style
import style from "./styles/sidebar.module.css";

export default function Sidebar({ visible, setVisible, menu, activeMenu }) {
  const buttonTemplate = () => {
    if (visible) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#626262" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="#626262" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
  };

  const toggleSidebar = () => {
    setVisible((prev) => (prev ? false : true));
  };

  return (
    <div className={style["sidebar"]}>
      <div className={style["logo-telkomsel"]}>
        <Image src="/logo_telkomsel.png" alt="logo telkomsel" fill />
      </div>
      <div className={style["menu-wrapper"]}>
        {(menu || []).map((item, index) => (
          <div key={index} className={`${style["menu"]} ${activeMenu === item.url ? style["active"] : ""}`}>
            <i className={`${style["menu-icon"]} pi ${item.icon}`}></i>
            <span className={style["menu-title"]}>{item.nama}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
