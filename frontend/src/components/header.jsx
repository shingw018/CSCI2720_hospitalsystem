/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import Cookies from "js-cookie";
import { Component } from "react";
import { Link } from "react-router-dom";
import { Logout } from "./auth";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = { switch: false };
    this.rerender = this.rerender.bind(this);
  }

  rerender() {
    this.setState({ switch: !this.state.switch });
  }

  render() {
    if (!Cookies.get("accessToken")) {
      return <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ minHeight: 56 }}></nav>;
    }

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="collapse navbar-collapse" id="navbarHeader">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/hospital">
                Hospital
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/map">
                Map
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                Profile
              </Link>
            </li>
            {/* <li className="nav-item">
                            <Link className='nav-link' to="/chart" >Chart</Link>
                        </li> */}
            {Cookies.get("username") === "admin" ? (
              <li className="nav-item">
                <Link className="nav-link" to="/user">
                  User
                </Link>
              </li>
            ) : (
              <> </>
            )}
          </ul>
        </div>

        <Logout done={this.rerender} />
      </nav>
    );
  }
}

export default Header;
