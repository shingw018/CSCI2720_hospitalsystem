/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "../App.css";
import Cookies from "js-cookie";
import API from "../middleware/api";
import { DropdownButton, Dropdown } from "react-bootstrap";

class Login extends Component {
  constructor(props) {
    super(props);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.state = {
      username: undefined,
      password: undefined,
      error: false,
      errorMessage: undefined,
      loggedIn: false,
    };
  }

  // onChange function connected to the username state
  handleUsernameChange(e) {
    this.setState({ username: e.target.value });
  }

  // onChange function connected to the password state
  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  // onClick function connected to Sign in button
  async submitForm(e) {
    e.preventDefault();
    const loginInfo = {
      username: this.state.username,
      password: this.state.password,
    };

    try {
      const res = await API.post("/auth/login", loginInfo);
      // console.log(res)
      Cookies.set("username", res.data.user.username, { sameSite: "Strict" }); // Save username in cookie for future use
      Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
      Cookies.set("refreshToken", res.data.refreshToken, { sameSite: "Strict" });
      Cookies.set("userId", res.data.userId, { sameSite: "Strict" });
      this.setState({ loggedIn: true });
      this.props.done();
    } catch (err) {
      // console.log(err.response.data.description)
      if (err.response?.data?.description) {
        document.getElementById("signinform").reset();
        this.setState({
          error: true,
          errorMessage: `* ${err.response.data.description}`, // errorMessage handled by backend
        });
      }
    }
  }

  // Redirect to profile page after successfully logged in
  render() {
    if (Cookies.get("accessToken")) {
      return <Redirect to="/home" />;
    }
    return (
      <>
        {!this.state.loggedIn ? (
          <div className="container my-3">
            <h2 className="text-center">CSCI 2720 Group 20 Project</h2>
            <h3 className="text-center">Hospital Waiting Time System</h3>
            <h5>Sign In</h5>
            <form id="signinform" onSubmit={this.submitForm}>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="bi bi-person-circle"></i>
                </span>
                <input
                  type="text"
                  name="username"
                  className="form-control col-auto"
                  placeholder="Username"
                  id="username"
                  required
                  onChange={this.handleUsernameChange}
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="bi bi-key-fill"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  placeholder="Password"
                  required
                  onChange={this.handlePasswordChange}
                />
              </div>
              {this.state.error && <div className="text-danger">{this.state.errorMessage}</div>}
              <input
                data-testid="login-submit"
                className="btn btn-md btn-primary mt-3"
                style={{ float: "right" }}
                type="submit"
                value="Sign in"
              />
            </form>
          </div>
        ) : (
          <Redirect to="/hospital" />
        )}
      </>
    );
  }
}
class Logout extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.state = {
      loggedIn: true,
    };
  }

  async handleLogout() {
    try {
      await API.delete(`/auth/logout/${Cookies.get("refreshToken")}`, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      Cookies.remove("accessToken", { sameSite: "Strict" });
      Cookies.remove("refreshToken", { sameSite: "Strict" });
      Cookies.remove("userId", { sameSite: "Strict" });
      Cookies.remove("username", { sameSite: "Strict" });

      this.setState({ loggedIn: false });
      this.props.done();
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });

          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.handleLogout();
        } else {
          console.log(err);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  render() {
    return (
      <>
        {this.state.loggedIn ? (
          <DropdownButton id="logoutDropdown" title={Cookies.get("username")} variant="secondary">
            <Dropdown.Item onClick={this.handleLogout}>Logout</Dropdown.Item>
          </DropdownButton>
        ) : (
          <Redirect to="/" />
        )}
      </>
    );
  }
}
export { Login, Logout };
