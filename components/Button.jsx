import style from "./styles/button.module.css";

// Font
import { Inter } from "@next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function Button({ children = "Button", type, onClick, className, secondary = false }) {
  return (
    <button className={`${inter.className} ${style["button"]} ${secondary ? style["secondary"] : ""} ${className} `} onClick={onClick} type={type ? type : undefined}>
      {children}
    </button>
  );
}
