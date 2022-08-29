/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import React, { Component } from "react";
import { Line } from "react-chartjs-2";
import API from "../middleware/api";
import Cookies from "js-cookie";
import { Redirect } from "react-router";

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = { content: <ChartPastHours /> };
    this.showContent = this.showContent.bind(this);
  }

  showContent(content) {
    if (content === "pastHours") {
      this.setState({ content: <ChartPastHours /> });
    } else {
      this.setState({ content: <ChartPastDays /> });
    }
  }

  render() {
    if (!Cookies.get("accessToken")) return <Redirect to="/" />;
    return (
      <>
        <div className="container m-2">
          <ul className="list-group list-group-horizontal">
            <li className="list-group-item list-group-item-primary">
              <button className="btn btn-outline-none" onClick={() => this.showContent("pastHours")}>
                Waiting Time in the past 10 hours
              </button>
            </li>
            <li className="list-group-item list-group-item-primary">
              <button className="btn btn-outline-none" onClick={() => this.showContent("pastDays")}>
                Waiting Time of the past 7 days
              </button>
            </li>
          </ul>
        </div>
        <div>{this.state.content}</div>
      </>
    );
  }
}

class ChartPastHours extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hospitals: [],
      targetHospitalName: "",
      data: { labels: [], datasets: [] },
      options: { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } },
    };
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.getData = this.getData.bind(this);
    this.fetchHospitals = this.fetchHospitals.bind(this);
  }

  componentDidMount() {
    this.fetchHospitals();
  }

  async fetchHospitals() {
    try {
      const res = await API.get("/hospitals", {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      this.setState({ hospitals: res.data });
      this.getData("Overview");
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.fetchHospitals();
        } else {
          console.log(err);
        }
      } catch (err) {
        if (err.response?.data) {
          console.log(err.response.data);
        }
      }
    }
  }

  async getData(target) {
    let targetHospitalData = [];
    if (target === "Overview") {
      targetHospitalData = this.state.hospitals.map((hospital) => {
        return {
          label: hospital.name,
          data: hospital.past10HoursWaitingTime.slice().reverse(),
          borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          tension: 0.1,
          borderWidth: 2,
        };
      });
    } else {
      targetHospitalData = [
        {
          label: "Waiting Time",
          data: this.state.hospitals
            .filter((hospital) => hospital.name === target)[0]
            .past10HoursWaitingTime.slice()
            .reverse(),
          borderColor: "rgb(75, 99, 132)",
          tension: 0.1,
          borderWidth: 2,
        },
      ];
    }

    if (targetHospitalData === null || targetHospitalData === []) return;

    const data = {
      datasets: targetHospitalData,
    };
    const options = {
      parsing: {
        xAxisKey: "updateTime",
        yAxisKey: "waitTime",
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Hours",
          },
          min: 0,
          max: 12,
        },
      },
    };
    this.setState({ data, options });
  }

  handleTargetChange(e) {
    this.setState({ targetHospitalName: e.target.value });
    this.getData(e.target.value);
  }

  render() {
    return (
      <div className="container">
        <div className="container header">
          <h2 className="title text-center">Waiting Time in the past 10 hours</h2>
        </div>
        <div className="container">
          <select
            name="waitingTime"
            id="waitingTime"
            value={this.state.targetHospitalName}
            onChange={this.handleTargetChange}
          >
            <option value="Overview">Overview</option>
            {this.state.hospitals.map((item, index) => {
              return (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <Line data={this.state.data} options={this.state.options} />
        </div>
      </div>
    );
  }
}

class ChartPastDays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hospitals: [],
      targetHospitalName: "",
      data: { labels: [], datasets: [] },
      options: { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } },
    };
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.getData = this.getData.bind(this);
    this.fetchHospitals = this.fetchHospitals.bind(this);
  }

  componentDidMount() {
    this.fetchHospitals();
  }

  async fetchHospitals() {
    try {
      const res = await API.get("/hospitals", {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      this.setState({ hospitals: res.data });
      this.getData("Overview");
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.fetchHospitals();
        } else {
          console.log(err);
        }
      } catch (err) {
        if (err.response?.data) {
          console.log(err.response.data);
        }
      }
    }
  }

  async getData(target) {
    let targetHospitalData = [];
    if (target === "Overview") {
      targetHospitalData = this.state.hospitals.map((hospital) => {
        return {
          label: hospital.name,
          data: hospital.past7DaysWaitingTime.slice().reverse(),
          borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          tension: 0.1,
          borderWidth: 2,
        };
      });
    } else {
      targetHospitalData = [
        {
          label: "Waiting Time",
          data: this.state.hospitals
            .filter((hospital) => hospital.name === target)[0]
            .past7DaysWaitingTime.slice()
            .reverse(),
          borderColor: "rgb(75, 99, 132)",
          tension: 0.1,
          borderWidth: 2,
        },
      ];
    }

    if (targetHospitalData === null || targetHospitalData === []) return;

    const data = {
      datasets: targetHospitalData,
    };
    const options = {
      parsing: {
        xAxisKey: "updateTime",
        yAxisKey: "waitTime",
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Hours",
          },
          min: 0,
          max: 12,
        },
      },
    };
    this.setState({ data, options });
  }

  handleTargetChange(e) {
    this.setState({ targetHospitalName: e.target.value });
    this.getData(e.target.value);
  }

  render() {
    return (
      <div className="container">
        <div className="container header">
          <h2 className="title text-center">Waiting Time in this hour of past 7 days</h2>
        </div>
        <div className="container">
          <select
            name="waitingTime"
            id="waitingTime"
            value={this.state.targetHospitalName}
            onChange={this.handleTargetChange}
          >
            <option value="Overview">Overview</option>
            {this.state.hospitals.map((item, index) => {
              return (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <Line data={this.state.data} options={this.state.options} />
        </div>
      </div>
    );
  }
}

export default Chart;
