import React from "react";
import { useHistory } from "react-router-dom";
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
        <div>
          <input className="nav-home" type="submit" value="Acasă" onClick={onClickHome}></input>
          <input className="nav-contact" type="submit" value="Contact" onClick={onClickContact}></input>
          <input className="nav-signout" type="submit" value="Deconectare" onClick={onClickSignOut}></input>
        </div>
      </>
    );
  } else {
    return (
      <>
        <input className="nav-home" type="submit" value="Acasă" onClick={onClickHome}></input>
        <input className="nav-contact" type="submit" value="Contact" onClick={onClickContact}></input>
      </>
    );
  }
};

export default Nav;
