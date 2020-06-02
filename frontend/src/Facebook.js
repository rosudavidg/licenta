import React from "react";
import FacebookLogin from "react-facebook-login";
import { useHistory } from "react-router-dom";
import axios from "axios";

import "./Facebook.css";

const Facebook = (props) => {
  const history = useHistory();

  const loginCallback = (response) => {
    console.log(response);

    axios
      .post("/users/login", {
        userId: response.id,
        token: response.accessToken,
      })
      .then((res) => {
        let jwt_token = res.data;

        localStorage.setItem("token", jwt_token);

        props.setLoggedIn(true);

        history.push("/");
      })
      .catch((e) => {
        alert(`Login failed!\nError: ${e.response.data.error}`);
      });
  };

  return (
    <FacebookLogin
      textButton="Conectează-te cu Facebook"
      appId="477757086225197"
      size="medium"
      autoLoad={true}
      callback={loginCallback}
      icon="fa-facebook"
    />
  );
};

export default Facebook;
