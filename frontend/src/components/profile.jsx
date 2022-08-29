/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import Cookies from "js-cookie";
import { Component, Fragment } from "react";
import API from "../middleware/api";
import { Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Redirect } from "react-router";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favList: [],
      hospitals: [],
      fetched: false,
      notFound: false,
    };
  }

  componentDidMount() {
    this.getUserFavList = this.getUserFavList.bind(this);

    this.getUserFavList();
  }

  async getUserFavList() {
    try {
      const res = await API.get(`/users/${Cookies.get("userId")}/favHospitals`, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });

      this.setState({ favList: res.data, fetched: true });

      console.log(this.state.favList);
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.getUserFavList();
        } else {
          console.log(err);
          this.setState({ notFound: true });
        }
      } catch (err) {
        if (err.response?.data) {
          console.log(err.response.data);
          this.setState({ notFound: true });
        }
      }
    }
  }
  render() {
    if (!Cookies.get("accessToken")) return <Redirect to="/" />;
    return (
      <>
        {!this.state.fetched ? (
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        ) : (
          <>
            <h2>Favourite Hospital</h2>
            {this.state.favList.map((hospital, index) => {
              return (
                <Fragment key={index}>
                  <Link className="m-1 p-1 card border-dark" to={"/hospital/" + hospital._id}>
                    {hospital.name}
                  </Link>
                </Fragment>
              );
            })}
          </>
        )}
      </>
    );
  }
}

export default Profile;
