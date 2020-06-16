import React from "react"
import { Link } from "react-router-dom"
import t from "../../utils/translate/translate"

const SideMenu = ({ path }) => {
  return (
    <nav className="ldc-side-menu">
      <Link to="/admin" data-text={t("admin")}>
        <div>A</div>
      </Link>
      <Link
        to="/buy-leads"
        className={path === "/buy-leads" ? "sm-active" : ""}
        data-text={t("buy tab")}
      >
        <div className="menu-icons cart" />
      </Link>
      <Link
        to="/auctions"
        className={path === "/auctions" ? "sm-active" : ""}
        data-text={t("auction tab")}
      >
        <div className="menu-icons">
          <i className="fas fa-gavel" />
        </div>
      </Link>
      <Link
        to="/sell-leads"
        className={path === "/sell-leads" ? "sm-active" : ""}
        data-text={t("sell tab")}
      >
        <div className="menu-icons coins" />
      </Link>
      <Link
        to="/my-leads"
        className={path === "/my-leads" ? "sm-active" : ""}
        data-text={t("my tab")}
      >
        <div className="menu-icons clipboard" />
      </Link>
    </nav>
  )
}

export default SideMenu
