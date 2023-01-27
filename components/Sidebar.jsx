import Link from "next/link";
import Image from "next/image";

// Style
import style from "./styles/sidebar.module.css";

export default function Sidebar({ visible, setVisible, menu, activeMenu }) {
  return (
    <div className={`${style["sidebar"]} ${visible ? '' : style['hide']}`}>
      <button className={style['toggle-sidebar']} onClick={() => setVisible((prev) => prev ? false : true)}>
        <i className={`pi ${visible ? 'pi-chevron-left' : 'pi-chevron-right'}`}></i>
      </button>
      {visible && (
        <>
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
        </>
      )}
    </div>
  );
}
