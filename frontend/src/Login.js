import React from "react";
import Facebook from "./Facebook";
import { Helmet } from "react-helmet";

import "./Login.css";

const Login = (props) => {
  return (
    <>
      <Helmet>
        <title>Avatario - Conectare</title>
      </Helmet>
      <div className="login">
        <div className="top">
          <div className="login-container-left">
            <div className="login-text-1">Menține-ți creierul</div>
            <div className="login-text-2">ACTIV</div>
          </div>
          <div className="login-container-right">
            <Facebook setLoggedIn={props.setLoggedIn} />
          </div>
        </div>
        <div className="bottom">Despre oameni. Pentru oameni.</div>
      </div>
    </>
  );
};

export default Login;
