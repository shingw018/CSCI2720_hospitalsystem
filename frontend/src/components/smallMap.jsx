/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import React, { Component } from "react";
import { Map, Marker } from "google-maps-react";

export class SmallMapContainer extends Component {
  constructor(props) {
    super(props);
    console.log("this.props");

    console.log(this.props);
  }

  render() {
    return (
      <>
        <Map
          google={this.props.google}
          zoom={15}
          style={{ width: "100%", height: "100%", position: "relative" }}
          initialCenter={{ lat: this.props.hospital.latitude, lng: this.props.hospital.longitude }}
        >
          <Marker
            position={{ lat: this.props.hospital.latitude, lng: this.props.hospital.longitude }}
            name={"Current location"}
          />
        </Map>
      </>
    );
  }
}
