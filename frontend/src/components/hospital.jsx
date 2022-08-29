/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import React, { Component } from "react";
import API from "../middleware/api";
import Cookies from "js-cookie";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import Pagination from "../common/pagination";
import { paginate } from "../utils/paginate";
import _ from "lodash";

const hospitalNameOption = [
  "Alice Ho Miu Ling Nethersole Hospital",
  "Caritas Medical Centre",
  "Kwong Wah Hospital",
  "North District Hospital",
  "North Lantau Hospital",
  "Princess Margaret Hospital",
  "Pok Oi Hospital",
  "Prince of Wales Hospital",
  "Pamela Youde Nethersole Eastern Hospital",
  "Queen Elizabeth Hospital",
  "Queen Mary Hospital",
  "Ruttonjee Hospital",
  "St John Hospital",
  "Tseung Kwan O Hospital",
  "Tuen Mun Hospital",
  "Tin Shui Wai Hospital",
  "United Christian Hospital",
  "Yan Chai Hospital",
];

const districtOption = [
  "Central and Western",
  "Eastern",
  "Southern",
  "Wan Chai",
  "Sham Shui Po",
  "Kowloon City",
  "Kwun Tong",
  "Wong Tai Sin",
  "Yau Tsim Mong",
  "Islands",
  "Kwai Tsing",
  "North",
  "Sai Kung",
  "Sha Tin",
  "Tai Po",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
];

class Hospital extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSearch: "*",
      fetched: false,
      favList: [],
      hospitals: [],
      hospitalsCopyForSearch: [],
      showCreatePopUp: false,
      updateTime: undefined,
    };
    //binding functions
    this.createRef = React.createRef();
    this.fetchHospitals = this.fetchHospitals.bind(this);
    this.fetchHospitalTime = this.fetchHospitalTime.bind(this);
    this.getTargetTime = this.getTargetTime.bind(this);
    this.getUserFavList = this.getUserFavList.bind(this);
    this.searchUpdate = this.searchUpdate.bind(this);
    this.toggleShowCreatePopUp = this.toggleShowCreatePopUp.bind(this);
    this.updateChartData = this.updateChartData.bind(this);
    this.updateFavList = this.updateFavList.bind(this);
  }

  componentDidMount() {
    this.fetchHospitals();
    this.getUserFavList();
  }

  async fetchHospitals() {
    try {
      const res = await API.get("/hospitals", {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      console.log(res.data);
      this.setState({ hospitals: res.data, hospitalsCopyForSearch: res.data, updateTime: res.data[0]?.lastUpdateTime });
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

  async fetchHospitalTime(today) {
    let year = today.getFullYear().toString().padStart(4, "0");
    let month = (today.getMonth() + 1).toString().padStart(2, "0");
    let day = today.getDate().toString().padStart(2, "0");
    let hour = today.getHours().toString().padStart(2, "0");
    let minute = (Math.floor(today.getMinutes() / 15) * 15).toString().padStart(2, "0");
    let dateTime = `${year}${month}${day}-${hour}${minute}`;
    console.log(`fetching ${dateTime} version`);
    try {
      const res = await fetch(
        `https://api.data.gov.hk/v1/historical-archive/get-file?url=http%3A%2F%2Fwww.ha.org.hk%2Fopendata%2Faed%2Faedwtdata-en.json&time=${dateTime}`
      );
      const fetchedData = await res.json();
      // Update hospitals with the newly fetched waitTime
      try {
        await API.patch("/hospitals", fetchedData, {
          headers: {
            Authorization: Cookies.get("accessToken"),
          },
        });
        await this.fetchHospitals();
        await this.updateChartData();
      } catch (err) {
        try {
          if (err.response?.data?.message === "FORBIDDEN") {
            const res = await API.post("/auth/token", {
              token: Cookies.get("refreshToken"),
            });
            Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
            this.fetchHospitalTime(new Date());
          } else {
            console.log(err);
          }
        } catch (err) {
          if (err.response?.data) {
            console.log(err.response.data);
          }
        }
      }
    } catch (err) {
      console.log("error in fetch");
      console.log("fetch older version");

      // latest version not ready
      // fetch one version older

      // month - 1 since syntax problem
      // minute - 15 to fetch 15 mins before (negative also ok)
      this.fetchHospitalTime(new Date(year, month - 1, day, hour, minute - 15));
    }
  }

  getTargetTime(index, dataType) {
    //index start from 0
    //new Date --> 00 for midnight ; --> 12 for noon ; --> 24 will go to next day
    //lastUpdateTime --> hh:mm(am/pm) ; --> 12:00am for midnight --> 12:00pm for noon
    const lastUpdateTime = this.state.hospitals[0].lastUpdateTime;
    //const lastUpdateTime = '6/5/2021 2:15am';
    // console.log('lastUpdateTime: ', lastUpdateTime)
    const year = lastUpdateTime.split(" ")[0].split("/")[2];
    const month = lastUpdateTime.split(" ")[0].split("/")[1];
    const day = lastUpdateTime.split(" ")[0].split("/")[0];
    let hour = lastUpdateTime.split(" ")[1].split(":")[0];
    let minute = lastUpdateTime
      .split(" ")[1]
      .split(":")[1]
      .replace(/[a-z\s]/g, "");
    const period = lastUpdateTime.split(" ")[1].split(":")[1].slice(-2);
    if (hour === "12") {
      if (period === "am") hour = (parseInt(hour) - 12).toString();
    } else if (period === "pm") {
      hour = (parseInt(hour) + 12).toString();
    }
    minute = (parseInt(minute) + 15).toString();

    // console.log(`before modify: ${year}/${month}/${day}/${hour}/${minute}/${period}`)

    if (dataType === "hours") {
      let targetTime = new Date(year, month - 1, day, parseInt(hour) - index, minute);
      let yearToReturn = targetTime.getFullYear().toString().padStart(4, "0");
      let monthToReturn = (targetTime.getMonth() + 1).toString().padStart(2, "0");
      let dayToReturn = targetTime.getDate().toString().padStart(2, "0");
      let hourToReturn = targetTime.getHours().toString().padStart(2, "0");
      let minuteToReturn = targetTime.getMinutes().toString().padStart(2, "0");
      const targetTimeToReturn = `${yearToReturn}${monthToReturn}${dayToReturn}-${hourToReturn}${minuteToReturn}`;
      // console.log('fetching version of: ', targetTimeToReturn);
      return targetTimeToReturn;
    } else {
      let targetTime = new Date(year, month - 1, parseInt(day) - index, hour, minute);
      let yearToReturn = targetTime.getFullYear().toString().padStart(4, "0");
      let monthToReturn = (targetTime.getMonth() + 1).toString().padStart(2, "0");
      let dayToReturn = targetTime.getDate().toString().padStart(2, "0");
      let hourToReturn = targetTime.getHours().toString().padStart(2, "0");
      let minuteToReturn = targetTime.getMinutes().toString().padStart(2, "0");
      const targetTimeToReturn = `${yearToReturn}${monthToReturn}${dayToReturn}-${hourToReturn}${minuteToReturn}`;
      // console.log('fetching version of: ', targetTimeToReturn);
      return targetTimeToReturn;
    }
  }

  async getUserFavList() {
    try {
      const res = await API.get(`/users/${Cookies.get("userId")}/favHospitals`, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      this.setState({ favList: res.data, fetched: true });
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
        }
      } catch (err) {
        if (err.response?.data) {
          console.log(err.response.data);
        }
      }
    }
  }

  searchUpdate(item) {
    if (item === "*") {
      this.setState({ currentSearch: "*" });
      this.fetchHospitals();
    } else {
      const hospitals = this.state.hospitalsCopyForSearch.filter((hospital) => hospital.waitingTime === item);
      this.setState({ hospitals, currentSearch: item });
    }
  }

  toggleShowCreatePopUp() {
    this.setState({ showCreatePopUp: !this.state.showCreatePopUp });
    this.createRef.current.setState({
      district: "",
      error: false,
      errorMessage: undefined,
      name: "",
    });
  }

  async updateChartData() {
    // set chart data of past 10 hours
    let dataSetPast10Hours = new Map();
    this.state.hospitals.forEach((hospital) => {
      dataSetPast10Hours.set(hospital.name, []);
    });

    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetch(
          `https://api.data.gov.hk/v1/historical-archive/get-file?url=http%3A%2F%2Fwww.ha.org.hk%2Fopendata%2Faed%2Faedwtdata-en.json&time=${this.getTargetTime(
            i,
            "hours"
          )}`
        );
        const fetchedData = await res.json();
        //console.log('update time split [1]: ', fetchedData.updateTime.split(' ')[1])

        fetchedData.waitTime.forEach((item) => {
          if (dataSetPast10Hours.has(item.hospName)) {
            let array = dataSetPast10Hours.get(item.hospName);
            const waitTimeHours = item.topWait.replace(/[A-Za-z\s]/g, "");
            array.push({ updateTime: fetchedData.updateTime.split(" ")[1], waitTime: waitTimeHours });
            dataSetPast10Hours.set(item.hospName, array);
          }
        });
      } catch (err) {
        console.log(err);
      }
    }

    // set chart data of past 7 days
    let dataSetPast7Days = new Map();
    this.state.hospitals.forEach((hospital) => {
      dataSetPast7Days.set(hospital.name, []);
    });

    for (let i = 0; i < 7; i++) {
      try {
        const res = await fetch(
          `https://api.data.gov.hk/v1/historical-archive/get-file?url=http%3A%2F%2Fwww.ha.org.hk%2Fopendata%2Faed%2Faedwtdata-en.json&time=${this.getTargetTime(
            i,
            "days"
          )}`
        );
        const fetchedData = await res.json();

        fetchedData.waitTime.forEach((item) => {
          if (dataSetPast7Days.has(item.hospName)) {
            let array = dataSetPast7Days.get(item.hospName);
            const waitTimeHours = item.topWait.replace(/[A-Za-z\s]/g, "");
            array.push({ updateTime: fetchedData.updateTime.split(" ")[0], waitTime: waitTimeHours });
            dataSetPast7Days.set(item.hospName, array);
          }
        });
      } catch (err) {
        console.log(err);
      }
    }

    // patch past 10 hours
    console.log("dataSetPast10Hours: ", Object.fromEntries(dataSetPast10Hours));
    try {
      await API.patch("/hospitals/past10HoursWaitingTime", Object.fromEntries(dataSetPast10Hours), {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          console.log("during 10 hours: token refreshed. updateChartData is not recalled.");
          this.updateChartData();
        } else {
          console.log(err);
        }
      } catch (err) {
        try {
          if (err.response?.data?.message === "FORBIDDEN") {
            const res = await API.post("/auth/token", {
              token: Cookies.get("refreshToken"),
            });
            Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
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

    //patch past 7 days
    console.log("dataSetPast7Days: ", Object.fromEntries(dataSetPast7Days));
    try {
      await API.patch("/hospitals/past7DaysWaitingTime", Object.fromEntries(dataSetPast7Days), {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          console.log("during 7 days: token refreshed. updateChartData is  not recalled.");
          //this.updateChartData();
        } else {
          console.log(err);
        }
      } catch (err) {
        try {
          if (err.response?.data?.message === "FORBIDDEN") {
            const res = await API.post("/auth/token", {
              token: Cookies.get("refreshToken"),
            });
            Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
            this.fetchHospitalTime(new Date());
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

    console.log("should be all chart data update finished!");
  }

  async updateFavList(hospital) {
    try {
      await API.patch(
        `/users/${Cookies.get("userId")}/favHospitals`,
        { hospitalID: hospital._id },
        {
          headers: {
            Authorization: Cookies.get("accessToken"),
          },
        }
      );
      this.getUserFavList();
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.updateFavList(hospital);
        } else if (err.response?.data?.message === "Body invalid") {
          document.getElementById("updateForm").reset();
          this.setState({
            error: true,
            errorMessage: `* ${err.response.data.description}`, // errorMessage handled by backend
          });
        } else {
          console.log(err);
          //something here to redirect?
        }
      } catch (err) {
        console.log(err);
        //something here to redirect?
      }
    }
  }

  render() {
    if (!Cookies.get("accessToken")) return <Redirect to="/" />;
    return !this.state.fetched ? (
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    ) : (
      <>
        <Search
          currentSearch={this.state.currentSearch}
          hospitals={this.state.hospitalsCopyForSearch}
          searchUpdate={this.searchUpdate}
        />
        <div>Last update time: {this.state.updateTime}</div>
        {Cookies.get("username") === "admin" && (
          <CreateHospitalPopUp
            done={this.fetchHospitals}
            ref={this.createRef}
            refresh={this.fetchHospitalTime}
            show={this.state.showCreatePopUp}
            toggle={this.toggleShowCreatePopUp}
          />
        )}
        <HospitalContent
          done={this.fetchHospitals}
          favList={this.state.favList}
          hospitals={this.state.hospitals}
          updateFavList={this.updateFavList}
        />
      </>
    );
  }
}

class Search extends Component {
  render() {
    return (
      <div className="container m-2">
        <ul className="list-group list-group-horizontal">
          <li
            className={`list-group-item list-group-item-primary ${this.props.currentSearch === "*" && "active"}`}
            onClick={() => this.props.searchUpdate("*")}
          >
            All
          </li>
          {_.orderBy(
            [
              ...new Set(
                this.props.hospitals.map((item) => {
                  return item.waitingTime;
                })
              ),
            ],
            [],
            ["asc"]
          ).map((element, index) => {
            return (
              <li
                className={`list-group-item list-group-item-primary ${
                  this.props.currentSearch === element && "active"
                }`}
                key={index}
                onClick={() => this.props.searchUpdate(element)}
              >
                {element}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

class CreateHospitalPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      district: "",
      error: false,
      errorMessage: undefined,
      longitude: undefined,
      latitude: undefined,
      name: "",
    };
    this.handleDistrictChange = this.handleDistrictChange.bind(this);
    this.handleLongitudeChange = this.handleLongitudeChange.bind(this);
    this.handleLatitudeChange = this.handleLatitudeChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleLongitudeChange(e) {
    this.setState({ longitude: e.target.value });
  }

  handleLatitudeChange(e) {
    this.setState({ latitude: e.target.value });
  }

  handleDistrictChange(e) {
    this.setState({ district: e.target.value });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { name, longitude, latitude, district } = this.state; //waitingTime
    const newHospital = { name, longitude, latitude, district }; //waitingTime

    try {
      const res = await API.post("/hospitals", newHospital, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      console.log(res.data);
      this.props.refresh(new Date());
      this.props.toggle();
      this.props.done();
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });

          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.handleSubmit(e);
        } else if (err.response?.data?.message === "Body invalid") {
          document.getElementById("createForm").reset();
          this.setState({
            error: true,
            errorMessage: `* ${err.response.data.description}`, // errorMessage handled by backend
          });
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
      <div className="container">
        <button className="btn btn-primary m-2" onClick={this.props.toggle}>
          <span className="mr-2">CREATE</span>
          <i className="bi bi-plus"></i>
        </button>
        <Modal show={this.props.show} onHide={this.props.toggle} backdrop="static" keyboard={false}>
          <Modal.Header closeButton>
            <Modal.Title>Create Hospital</Modal.Title>
          </Modal.Header>

          <form onSubmit={this.handleSubmit} id="createForm" autoComplete="off">
            <Modal.Body>
              <div className="input-group mb-3">
                <span className="input-group-text">Name</span>
                <select
                  name="name"
                  id="hospName"
                  className="form-control"
                  value={this.state.name}
                  onChange={this.handleNameChange}
                  required
                >
                  <option value="" disabled>
                    ---------------------------------------------------
                  </option>
                  {hospitalNameOption.map((name, index) => {
                    return (
                      <option key={index} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Longitude &deg;E</span>
                <input
                  type="text"
                  name="longitude"
                  className="form-control"
                  placeholder="longitude"
                  required
                  onChange={this.handleLongitudeChange}
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">Latitude &deg;N</span>
                <input
                  type="text"
                  name="latitude"
                  className="form-control"
                  placeholder="latitude"
                  required
                  onChange={this.handleLatitudeChange}
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text">District</span>
                <select
                  name="district"
                  id="hospDistrict"
                  className="form-control"
                  value={this.state.district}
                  onChange={this.handleDistrictChange}
                  required
                >
                  <option value="" disabled>
                    ---------------------------------------------------
                  </option>
                  {districtOption.map((district, index) => {
                    return (
                      <option key={index} value={district}>
                        {district}
                      </option>
                    );
                  })}
                </select>
              </div>
              {this.state.error && <div className="text-danger">{this.state.errorMessage}</div>}
            </Modal.Body>
            <Modal.Footer>
              <input className="btn btn-md btn-primary" type="submit" value="Create" style={{ float: "right" }} />
            </Modal.Footer>
          </form>
        </Modal>
        <button
          className="btn btn-success m-2"
          style={{ float: "right" }}
          onClick={() => this.props.refresh(new Date())}
        >
          <span className="mr-2">Refresh Data</span>
          <i className="bi bi-arrow-repeat"></i>
        </button>
      </div>
    );
  }
}

class HospitalContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEditPopUp: false,
      showDeletePopUp: false,
      showDetailpage: false,
      hospital: undefined,
      pageSize: 100,
      currentPage: 1,
      sortColumn: { path: "name", order: "asc" },
    };
    this.toggleShowEditPopUp = this.toggleShowEditPopUp.bind(this);
    this.toggleShowDeletePopUp = this.toggleShowDeletePopUp.bind(this);
    this.changeTargetEditHospital = this.changeTargetEditHospital.bind(this);
    this.changeTargetDeleteHospital = this.changeTargetDeleteHospital.bind(this);
    this.changeTargetDetailsPage = this.changeTargetDetailsPage.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.renderSortIcon = this.renderSortIcon.bind(this);
    this.editRef = React.createRef();
  }

  render() {
    //later do filtering then change the input to filtered hospitals
    const sorted = _.orderBy(this.props.hospitals, [this.state.sortColumn.path], [this.state.sortColumn.order]);

    const paginatedHospitals = paginate(sorted, this.state.currentPage, this.state.pageSize);
    return this.state.showDetailpage ? (
      <Redirect to={`/hospital/${this.state.hospital._id}`} />
    ) : (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th className="clickable" onClick={() => this.handleSort("name")}>
                Name {this.renderSortIcon("name")}
              </th>
              <th className="clickable" onClick={() => this.handleSort("waitingTime")}>
                Waiting Time {this.renderSortIcon("waitingTime")}
              </th>
              <th className="clickable" onClick={() => this.handleSort("district")}>
                District {this.renderSortIcon("district")}
              </th>
              <th>Details</th>
              <th>Favourite</th>
              {Cookies.get("username") === "admin" && (
                <>
                  <th>Edit</th>
                  <th>Delete</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedHospitals.map((hospital, index) => {
              return (
                <tr key={hospital._id}>
                  <td>{hospital.name}</td>
                  <td>{hospital.waitingTime}</td>
                  <td>{hospital.district}</td>
                  {Cookies.get("username") === "admin" ? (
                    <HospitalAdminActions
                      hospital={hospital}
                      favList={this.props.favList}
                      updateFavList={this.props.updateFavList}
                      changeTargetEditHospital={this.changeTargetEditHospital}
                      changeTargetDeleteHospital={this.changeTargetDeleteHospital}
                      changeTargetDetailsPage={this.changeTargetDetailsPage}
                    />
                  ) : (
                    <HospitalUserActions
                      hospital={hospital}
                      favList={this.props.favList}
                      updateFavList={this.props.updateFavList}
                      changeTargetDetailsPage={this.changeTargetDetailsPage}
                    />
                  )}
                </tr>
              );
            })}
            <EditHospitalPopUp
              show={this.state.showEditPopUp}
              toggle={this.toggleShowEditPopUp}
              hospital={this.state.hospital}
              done={this.props.done}
              ref={this.editRef}
            />
            <DeleteHospitalPopUp
              show={this.state.showDeletePopUp}
              toggle={this.toggleShowDeletePopUp}
              hospital={this.state.hospital}
              done={this.props.done}
            />
          </tbody>
        </table>
        <Pagination
          itemsCount={this.props.hospitals.length}
          pageSize={this.state.pageSize}
          onPageChange={this.handlePageChange}
          currentPage={this.state.currentPage}
        />
      </div>
    );
  }

  toggleShowEditPopUp() {
    this.setState({ showEditPopUp: !this.state.showEditPopUp });
  }

  toggleShowDeletePopUp() {
    this.setState({ showDeletePopUp: !this.state.showDeletePopUp });
  }

  changeTargetEditHospital(hospital) {
    this.setState({ hospital });
    this.editRef.current.setState({
      name: hospital.name,
      district: hospital.district,
      error: false,
      errorMessage: undefined,
    });
    this.toggleShowEditPopUp();
  }

  changeTargetDeleteHospital(hospital) {
    this.setState({ hospital });
    this.toggleShowDeletePopUp();
  }

  changeTargetDetailsPage(hospital) {
    this.setState({ hospital, showDetailpage: true });
  }

  handlePageChange(page) {
    this.setState({ currentPage: page });
  }

  handleSort(column) {
    const sortColumn = { ...this.state.sortColumn };
    if (sortColumn.path === column) sortColumn.order = sortColumn.order === "asc" ? "desc" : "asc";
    else {
      sortColumn.path = column;
      sortColumn.order = "asc";
    }
    this.setState({ sortColumn });
  }

  renderSortIcon(column) {
    if (column !== this.state.sortColumn.path) return null;
    if (this.state.sortColumn.order === "asc") return <i className="bi bi-sort-alpha-down"></i>;
    return <i className="bi bi-sort-alpha-down-alt"></i>;
  }
}

class HospitalAdminActions extends Component {
  constructor(props) {
    super(props);
    this.state = { getFavListDone: false, favButtonInfo: undefined };
    this.renderFavInfo = this.renderFavInfo.bind(this);
  }

  componentDidMount() {
    this.renderFavInfo();
  }

  componentDidUpdate(prevProps) {
    if (this.props.favList !== prevProps.favList) {
      this.renderFavInfo();
    }
  }

  renderFavInfo() {
    const favs = this.props.favList.filter((item) => item._id === this.props.hospital._id);
    if (favs.length === 0) {
      this.setState({ getFavListDone: true, favButtonInfo: { buttonName: "Bookmark", buttonIcon: "bi bi-heart" } });
    } else {
      this.setState({
        getFavListDone: true,
        favButtonInfo: { buttonName: "Bookmarked", buttonIcon: "bi bi-heart-fill" },
      });
    }
  }

  render() {
    return (
      this.state.getFavListDone && (
        <>
          <td>
            <Link className="btn btn-info" to={"/hospital/" + this.props.hospital._id}>
              <span className="mr-2">Details</span>
              <i className="bi bi-book"></i>
            </Link>
          </td>
          <td>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => this.props.updateFavList(this.props.hospital)}
              style={{ minWidth: "150px" }}
            >
              <span className="mr-2">{this.state.favButtonInfo.buttonName} </span>
              <i className={this.state.favButtonInfo.buttonIcon}></i>
            </button>
          </td>
          <td>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => this.props.changeTargetEditHospital(this.props.hospital)}
            >
              <span className="mr-2">Edit</span>
              <i className="bi bi-pen"></i>
            </button>
          </td>
          <td>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => this.props.changeTargetDeleteHospital(this.props.hospital)}
            >
              <span className="mr-2">Delete</span>
              <i className="bi bi-trash"></i>
            </button>
          </td>
        </>
      )
    );
  }
}

class HospitalUserActions extends Component {
  constructor(props) {
    super(props);
    this.state = { getFavListDone: false, favButtonInfo: undefined };
    this.renderFavInfo = this.renderFavInfo.bind(this);
  }

  componentDidMount() {
    this.renderFavInfo();
  }

  componentDidUpdate(prevProps) {
    if (this.props.favList !== prevProps.favList) {
      this.renderFavInfo();
    }
  }

  renderFavInfo() {
    const favs = this.props.favList.filter((item) => item._id === this.props.hospital._id);
    if (favs.length === 0) {
      this.setState({ getFavListDone: true, favButtonInfo: { buttonName: "Bookmark", buttonIcon: "bi bi-heart" } });
    } else {
      this.setState({
        getFavListDone: true,
        favButtonInfo: { buttonName: "Bookmarked", buttonIcon: "bi bi-heart-fill" },
      });
    }
  }

  render() {
    return (
      this.state.getFavListDone && (
        <>
          <td>
            <Link className="btn btn-info" to={"/hospital/" + this.props.hospital._id}>
              <span className="mr-2">Details</span>
              <i className="bi bi-book"></i>
            </Link>
          </td>
          <td>
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => this.props.updateFavList(this.props.hospital)}
              style={{ minWidth: "150px" }}
            >
              <span className="mr-2">{this.state.favButtonInfo.buttonName} </span>
              <i className={this.state.favButtonInfo.buttonIcon}></i>
            </button>
          </td>
        </>
      )
    );
  }
}

class EditHospitalPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: undefined,
      longitude: undefined,
      latitude: undefined,
      district: undefined,
      error: false,
      errorMessage: undefined,
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleLongitudeChange = this.handleLongitudeChange.bind(this);
    this.handleLatitudeChange = this.handleLatitudeChange.bind(this);
    this.handleDistrictChange = this.handleDistrictChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleLongitudeChange(e) {
    this.setState({ longitude: e.target.value });
  }

  handleLatitudeChange(e) {
    this.setState({ latitude: e.target.value });
  }

  handleDistrictChange(e) {
    this.setState({ district: e.target.value });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { name, longitude, latitude, district } = this.state; //waitingTime
    const newHospital = { name, longitude, latitude, district }; //waitingTime

    try {
      const res = await API.put(`/hospitals/${this.props.hospital?._id}`, newHospital, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      console.log("success update");
      console.log(res.data);
      this.props.toggle();
      this.props.done();
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });

          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.handleSubmit(e);
        } else if (err.response?.data?.message === "Body invalid") {
          document.getElementById("updateForm").reset();
          this.setState({
            error: true,
            errorMessage: `* ${err.response.data.description}`, // errorMessage handled by backend
          });
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
      <Modal show={this.props.show} onHide={this.props.toggle} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Update Hospital</Modal.Title>
        </Modal.Header>

        <form onSubmit={this.handleSubmit} id="updateForm" autoComplete="off">
          <Modal.Body>
            <div className="input-group mb-3">
              <span className="input-group-text">Name</span>
              <select
                name="name"
                id="hospName"
                className="form-control"
                value={this.state.name}
                onChange={this.handleNameChange}
              >
                {hospitalNameOption.map((name, index) => {
                  return (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text">Longitude &deg;E</span>
              <input
                type="text"
                name="longitude"
                className="form-control"
                placeholder={this.props.hospital?.longitude}
                onChange={this.handleLongitudeChange}
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text">Latitude &deg;N</span>
              <input
                type="text"
                name="latitude"
                className="form-control"
                placeholder={this.props.hospital?.latitude}
                onChange={this.handleLatitudeChange}
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text">District</span>
              <select
                name="district"
                id="hospDistrict"
                className="form-control"
                value={this.state.district}
                onChange={this.handleDistrictChange}
                required
              >
                {districtOption.map((district, index) => {
                  return (
                    <option key={index} value={district}>
                      {district}
                    </option>
                  );
                })}
              </select>
            </div>
            {this.state.error && <div className="text-danger">{this.state.errorMessage}</div>}
          </Modal.Body>
          <Modal.Footer>
            {/* <button type="button" className="btn btn-secondary" onClick={this.props.toggle}>
                            Close
                        </button> */}
            <input className="btn btn-md btn-primary" type="submit" value="Update" style={{ float: "right" }} />
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

class DeleteHospitalPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: undefined,
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
  }

  componentDidUpdate() {
    // reset this.state.name when close pop up
    if (!this.props.show && this.state.name) {
      this.setState({ name: undefined });
    }
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  async handleDelete(e) {
    e.preventDefault();

    try {
      await API.delete(`/hospitals/${this.props.hospital?._id}`, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      this.props.toggle();
      this.props.done();
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.handleDelete(e);
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
      <Modal show={this.props.show} onHide={this.props.toggle} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Hospital</Modal.Title>
        </Modal.Header>

        <form onSubmit={this.handleDelete} autoComplete="off">
          <Modal.Body>
            <div>
              To delete the hospital <b>{this.props.hospital?.name}</b>, type the name to confirm.
            </div>
            <input
              type="text"
              className="form-control mt-2"
              name="name"
              placeholder="Enter name"
              onChange={this.handleNameChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <button
              disabled={this.state.name !== this.props.hospital?.name}
              type="submit"
              className="btn btn-danger mt-3"
              style={{ float: "right" }}
            >
              Confirm
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

export default Hospital;
