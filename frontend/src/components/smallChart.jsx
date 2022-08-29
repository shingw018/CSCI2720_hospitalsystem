/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import React, { Component } from "react";
import { Line } from "react-chartjs-2";

import { ToggleButtonGroup, ToggleButton } from "react-bootstrap";

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: <></>,
      hospital: this.props.hospital,
    };
    console.log("this.props @@@");
    console.log(this.props);

    this.onClickHandler = this.onClickHandler.bind(this);
  }

  componentDidMount() {
    this.setState({ content: <ChartPastHours hospital={this.state.hospital} /> });
  }

  onClickHandler(content) {
    if (content === "pastHours") {
      this.setState({ content: <ChartPastHours hospital={this.state.hospital} /> });
    } else {
      this.setState({ content: <ChartPastDays hospital={this.state.hospital} /> });
    }
  }

  render() {
    return (
      <>
        <ToggleButtonGroup type="radio" name="options" defaultValue={1}>
          <ToggleButton value={1} variant="outline-secondary" onClick={() => this.onClickHandler("pastHours")}>
            Waiting Time in the past 10 hours
          </ToggleButton>
          <ToggleButton value={2} variant="outline-secondary" onClick={() => this.onClickHandler("pastDays")}>
            Waiting Time of the past 7 days
          </ToggleButton>
        </ToggleButtonGroup>

        <div>{this.state.content}</div>
      </>
    );
  }
}

class ChartPastHours extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hospital: this.props.hospital,
      data: { labels: [], datasets: [] },
      options: { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } },
      fetched: false,
    };
    console.log("this hospital:");
    console.log(this.props.hospital);
    console.log(this.state.hospital.past10HoursWaitingTime);
  }

  componentDidMount() {
    this.getData = this.getData.bind(this);
    this.getData();
  }

  async getData() {
    if (
      this.state.hospital.past10HoursWaitingTime === undefined ||
      this.state.hospital.past7DaysWaitingTime === null ||
      this.state.hospital.past10HoursWaitingTime.length === 0
    )
      return;

    let targetHospitalData = [
      {
        label: "Waiting Time",
        data: this.state.hospital.past10HoursWaitingTime.slice().reverse(),
        borderColor: "rgb(75, 99, 132)",
        tension: 0.1,
        borderWidth: 2,
      },
    ];

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
    this.setState({ data, options, fetched: true });
    console.log("TRUUUUUUUUUUUUUEEEEEEEEEE");
  }

  render() {
    return (
      <>
        {this.state.fetched ? (
          <div className="container">
            <div className="container header">
              <h2 className="title text-center">Waiting Time in the past 10 hours</h2>
            </div>
            <div>
              <Line data={this.state.data} width={70} height={30} options={this.state.options} />
            </div>
          </div>
        ) : (
          <p>No hours data available for this hospital, Please refresh the data</p>
        )}
      </>
    );
  }
}

class ChartPastDays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hospital: this.props.hospital,
      data: { labels: [], datasets: [] },
      options: { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } },
      fetched: false,
    };
  }

  componentDidMount() {
    this.getData = this.getData.bind(this);
    this.getData();
  }

  async getData() {
    if (
      this.state.hospital.past7DaysWaitingTime === undefined ||
      this.state.hospital.past7DaysWaitingTime === null ||
      this.state.hospital.past7DaysWaitingTime.length === 0
    )
      return;

    const data = {
      datasets: [
        {
          label: "Waiting Time",
          data: this.state.hospital.past7DaysWaitingTime.slice().reverse(),
          borderColor: "rgb(75, 99, 132)",
          tension: 0.1,
          borderWidth: 2,
        },
      ],
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
    this.setState({ data, options, fetched: true });
  }

  render() {
    return (
      <>
        {this.state.fetched ? (
          <div className="container">
            <div className="container header">
              <h2 className="title text-center">Waiting Time in this hour of past 7 days</h2>
            </div>
            <div>
              <Line data={this.state.data} width={70} height={30} options={this.state.options} />
            </div>
          </div>
        ) : (
          <p>No past day data available for this hospital, Please refresh the data</p>
        )}
      </>
    );
  }
}

export default Chart;
