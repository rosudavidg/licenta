import React from "react";
import { useHistory } from "react-router-dom";
import { getProfilepic } from "./Auth.js";
import "./Nav.css";

const Nav = (props) => {
  const history = useHistory();

  const onClickSignOut = () => {
    localStorage.removeItem("token");
    props.setLoggedIn(false);
    history.push("/");
  };

  const onClickHome = () => {
    history.push("/");
  };

  const onClickFAQ = () => {
    history.push("/faq");
  };

  const onClickContact = () => {
    history.push("/contact");
  };

  if (props.loggedIn) {
    return (
      <>
        <input className="nav-home" type="submit" value="Acasă" onClick={onClickHome}></input>
        <input className="nav-contact" type="submit" value="Despre" onClick={onClickContact}></input>
        <input className="nav-signout" type="submit" value="Deconectare" onClick={onClickSignOut}></input>
        <img className="nav-icon" src={`data:image/jpeg;base64,${getProfilepic()}`} />
      </>
    );
  } else {
    return (
      <>
        <input className="nav-home" type="submit" value="Acasă" onClick={onClickHome}></input>
        <input className="nav-contact" type="submit" value="Despre" onClick={onClickContact}></input>
      </>
    );
  }
};

export default Nav;
