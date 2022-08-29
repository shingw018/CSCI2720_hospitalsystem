/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import React, { Component } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import API from "../middleware/api";
import Cookies from "js-cookie";
import { Spinner } from "react-bootstrap";
import { Redirect } from "react-router";

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: [],
      hospitals: [],
      fetched: false,
      notFound: false,
    };
    this.onMarkerClick = this.onMarkerClick.bind(this);
  }

  componentDidMount() {
    this.getHospital = this.getHospital.bind(this);
    this.getHospital();
  }

  async getHospital() {
    try {
      //console.log("hos")

      const res = await API.get(`/hospitals`, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });

      let pos = [];
      res.data.forEach((data, idx) =>
        pos.push({ name: data.name, lat: data.latitude, lng: data.longitude, index: idx, _id: data._id })
      );
      if (pos.length !== 0) {
        this.setState({ hospitals: pos, fetched: true });
      } else {
        this.setState({ notFound: true, fetched: true });
      }
      //console.log(this.state.hospitals)
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.getHospital();
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

  onMarkerClick(index) {
    //console.log("clicked");
    console.log(this.state.hospitals);
    this.props.history.push("/hospital/" + this.state.hospitals[index]._id);
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
            {!this.state.notFound ? (
              <div style={{ width: "70vw", height: "90vh" }}>
                <LoadScript googleMapsApiKey="AIzaSyAatUHkUsv9v4ZbnfN6dNebgqAkFpjV_0s">
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    center={{ lat: this.state.hospitals[0].lat, lng: this.state.hospitals[0].lng }}
                    zoom={11}
                  >
                    {this.state.hospitals.map((hospital, index) => {
                      return (
                        <Marker
                          key={index}
                          title={hospital.name}
                          position={{ lat: hospital.lat, lng: hospital.lng }}
                          onClick={() => this.onMarkerClick(index)}
                        />
                      );
                    })}
                  </GoogleMap>
                </LoadScript>
              </div>
            ) : (
              <h2>No hospital is created</h2>
            )}
          </>
        )}
      </>
    );
  }
}

class SmallMapContainer extends Component {
  constructor(props) {
    super(props);
    console.log("this.props");
    this.state = {
      latlng: {
        lat: this.props.hospital.latitude,
        lng: this.props.hospital.longitude,
      },
      name: this.props.hospital.name,
    };
    console.log(this.props);
  }

  render() {
    return (
      <>
        <LoadScript googleMapsApiKey="AIzaSyAatUHkUsv9v4ZbnfN6dNebgqAkFpjV_0s">
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            center={this.state.latlng}
            zoom={15}
          >
            <Marker position={this.state.latlng} name={"Current location"} title={this.state.name} />
          </GoogleMap>
        </LoadScript>
      </>
    );
  }
}

export { MapContainer, SmallMapContainer };
