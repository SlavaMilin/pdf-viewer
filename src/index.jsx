import React from "react";
import { render } from "react-dom";
import App from "./components/app";
import SecondWindow from "./components/second-window";
import { BrowserRouter as Router, Route } from "react-router-dom";

render(
  <Router>
    <div>
      <Route path="/" exact component={App} />
      <Route path="/inner" component={SecondWindow} />
    </div>
  </Router>,
  document.getElementById("react-container")
);
