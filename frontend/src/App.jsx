/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import { Component } from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { Login } from "./components/auth";
import Header from "./components/header";
// import Home from "./components/home";
import User from "./components/user";
import Hospital from "./components/hospital";
import { MapContainer } from "./components/map";
import Profile from "./components/profile";
import ViewHospital from "./components/hospitalDetail";
import Chart from "./components/chart";
import Cookies from "js-cookie";

class App extends Component {
  constructor(props) {
    super(props);

    this.rerender = this.rerender.bind(this);

    this.state = {
      switch: false,
    };
  }

  rerender() {
    this.setState({ switch: !this.state.switch });
  }

  render() {
    return (
      <Router>
        <Header />

        <div className="container">
          <Switch>
            <Route path="/" exact component={() => <Login done={this.rerender} />} />
            {/* <Route path="/home" component={Home} /> */}
            <Route path="/home" component={Chart} />
            <Route path="/user" component={User} />
            <Route path="/hospital/:hId" component={ViewHospital} />
            <Route path="/hospital" component={Hospital} />
            <Route path="/map" component={MapContainer} />
            <Route path="/profile" component={Profile} />
            {/* <Route path="/chart" component={Chart} /> */}
            <Route path="*" component={NoMatch} />
          </Switch>
        </div>
      </Router>
    );
  }
}

function NoMatch() {
  if (!Cookies.get("accessToken")) return <Redirect to="/" />;
  return <Redirect to="/home" />;
}

export default App;
