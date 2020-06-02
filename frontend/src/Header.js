import React from "react";
import Nav from "./Nav.js";
import "./Header.css";

const Header = (props) => {
  return (
    <header>
      <div className="header-title">Avatario</div>
      <div className="header-nav">
        <Nav loggedIn={props.loggedIn} setLoggedIn={props.setLoggedIn} />
      </div>
    </header>
  );
};

export default Header;
