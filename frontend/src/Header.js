import React from "react";
import Nav from "./Nav.js";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = (props) => {
  const history = useHistory();

  return (
    <header>
      <div
        className="header-title"
        onClick={() => {
          history.push("/");
        }}
      >
        Avatario
      </div>
      <div className="header-nav">
        <Nav loggedIn={props.loggedIn} setLoggedIn={props.setLoggedIn} />
      </div>
    </header>
  );
};

export default Header;
