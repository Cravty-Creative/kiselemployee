import style from "./styles/loading.module.css";

export default function Loading({ visible = false, description = "Loading", label = "Please Wait" }) {
  if (visible) {
    return (
      <div className={style["loading-wrapper"]}>
        <div className={style["loading-body"]}>
          <i className="pi pi-spin pi-spinner"></i>
          <div className={style["title-wrapper"]}>
            <p>{description}</p>
            <span>{label}</span>
          </div>
        </div>
      </div>
    );
  }
}
