/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import Cookies from "js-cookie";
import { Component } from "react";
import { Redirect } from "react-router";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (!Cookies.get("accessToken")) {
      return <Redirect to="/" />;
    }
    return <h1>HOME PAGE</h1>;
  }
}

export default Home;
