import React, { useState } from "react";
import Header from "./Header";
import Content from "./Content";
import Footer from "./Footer";
import Login from "./Login";
import Bot from "./Bot";
import Home from "./Home";
import { Helmet } from "react-helmet";

import { isUserAuthenticated } from "./Auth.js";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(isUserAuthenticated());

  return (
    <>
      <BrowserRouter>
        <Helmet>
          <title>Avatario - Home</title>
        </Helmet>
        <div className="app">
          <Header setLoggedIn={setLoggedIn} loggedIn={loggedIn} />
          <div className="content-footer">
            <Content>
              <Switch>
                <Route
                  exact
                  path="/login"
                  render={() => {
                    if (!loggedIn) {
                      return <Login setLoggedIn={setLoggedIn} />;
                    } else {
                      return <Redirect to="/"></Redirect>;
                    }
                  }}
                />
                <Route
                  exact
                  path="/bot"
                  render={() => {
                    if (!loggedIn) {
                      return <Login setLoggedIn={setLoggedIn} />;
                    } else {
                      return <Bot />;
                    }
                  }}
                />
                <Route
                  exact
                  path="/"
                  render={() => {
                    if (loggedIn) {
                      return <Home />;
                    } else {
                      return <Redirect to="/login"></Redirect>;
                    }
                  }}
                />
                <Route
                  path="/"
                  render={() => {
                    if (loggedIn) {
                      return <Redirect to="/"></Redirect>;
                    } else {
                      return <Redirect to="/login"></Redirect>;
                    }
                  }}
                />
              </Switch>
            </Content>
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
