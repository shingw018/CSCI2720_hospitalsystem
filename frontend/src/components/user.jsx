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
import API from "../middleware/api";
import { Modal } from "react-bootstrap";

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopUp: false,
      switch: false,
      users: [],
      fetched: false,
    };
    this.toggleShowPopUp = this.toggleShowPopUp.bind(this);
  }

  componentDidMount() {
    this.fetchUser = this.fetchUser.bind(this);
    this.fetchUser();
  }

  async fetchUser() {
    try {
      const res = await API.get("/users", {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      console.log(res.data);
      this.setState({ fetched: false, users: res.data });
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.fetchUser();
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

  toggleShowPopUp() {
    this.setState({ showPopUp: !this.state.showPopUp });
  }

  render() {
    if (Cookies.get("username") !== "admin") {
      return <Redirect to="/home" />;
    }

    return (
      <>
        <div className="my-3">
          <button className="btn btn-primary" onClick={this.toggleShowPopUp}>
            <span className="mr-2">CREATE</span>
            <i className="bi bi-plus"></i>
          </button>
          <CreateUserPopUp show={this.state.showPopUp} toggle={this.toggleShowPopUp} done={this.fetchUser} />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th style={{ minWidth: "60%" }}>Password</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <UserContent users={this.state.users} done={this.fetchUser} />
          </tbody>
        </table>
      </>
    );
  }
}

class CreateUserPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: undefined,
      password: undefined,
      showPassword: false,
      error: false,
      errorMessage: undefined,
    };
    this.toggleShowPassword = this.toggleShowPassword.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.cancelErrorMessage = this.cancelErrorMessage.bind(this);
  }

  handleUsernameChange(e) {
    this.setState({ username: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const newUser = {
      username: this.state.username,
      password: this.state.password,
    };

    try {
      const res = await API.post("/users", newUser, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
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

  cancelErrorMessage() {
    this.setState({
      error: false,
      errorMessage: undefined,
    });
  }

  toggleShowPassword() {
    this.setState({ showPassword: !this.state.showPassword });
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={() => {
          this.props.toggle();
          this.cancelErrorMessage();
        }}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create User</Modal.Title>
        </Modal.Header>

        <form onSubmit={this.handleSubmit} id="createForm" autoComplete="off">
          <Modal.Body>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-person-circle"></i>
              </span>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="username"
                required
                onChange={this.handleUsernameChange}
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-key-fill"></i>
              </span>
              <input
                type={this.state.showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="password"
                required
                onChange={this.handlePasswordChange}
              />
              <div onMouseEnter={this.toggleShowPassword} onMouseLeave={this.toggleShowPassword}>
                <button type="button" className="btn" disabled>
                  <i className={`bi ${this.state.showPassword ? "bi-eye" : "bi-eye-slash"}`} />
                </button>
              </div>
            </div>
            {this.state.error && <div className="text-danger">{this.state.errorMessage}</div>}
          </Modal.Body>

          <Modal.Footer>
            <input className="btn btn-md btn-primary" type="submit" value="Create" style={{ float: "right" }} />
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

class UserContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEditPopUp: false,
      showDeletePopUp: false,
      user: undefined,
    };
    this.toggleShowEditPopUp = this.toggleShowEditPopUp.bind(this);
    this.toggleShowDeletePopUp = this.toggleShowDeletePopUp.bind(this);
    this.changeTargetEditUser = this.changeTargetEditUser.bind(this);
    this.changeTargetDeleteUser = this.changeTargetDeleteUser.bind(this);
  }

  toggleShowEditPopUp() {
    this.setState({ showEditPopUp: !this.state.showEditPopUp });
  }

  toggleShowDeletePopUp() {
    this.setState({ showDeletePopUp: !this.state.showDeletePopUp });
  }

  changeTargetEditUser(user) {
    if (user.username === "admin") {
      alert("You cannot edit yourself");
    } else {
      this.setState({ user });
      this.toggleShowEditPopUp();
    }
  }

  changeTargetDeleteUser(user) {
    if (user.username === "admin") {
      alert("You cannot delete yourself");
    } else {
      this.setState({ user });
      this.toggleShowDeletePopUp();
    }
  }

  render() {
    return (
      <>
        {this.props.users.map((user, index) => {
          return (
            <tr key={user._id}>
              <td>{index}</td>
              <td>{user.username}</td>
              {/* <td>{user.password}</td> */}
              <td>
                <input
                  type="password"
                  value={user.password}
                  disabled
                  style={{ background: "white", border: "none", width: "100%" }}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    this.changeTargetEditUser(user);
                  }}
                >
                  <span className="mr-2">Edit</span>
                  <i className="bi bi-pen"></i>
                </button>
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    this.changeTargetDeleteUser(user);
                  }}
                >
                  <span className="mr-2">Delete</span>
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          );
        })}
        <EditUserPopUp
          show={this.state.showEditPopUp}
          toggle={this.toggleShowEditPopUp}
          user={this.state.user}
          done={this.props.done}
        />
        <DeleteUserPopUp
          show={this.state.showDeletePopUp}
          toggle={this.toggleShowDeletePopUp}
          user={this.state.user}
          done={this.props.done}
        />
      </>
    );
  }
}

class EditUserPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: undefined,
      password: undefined,
      showPassword: false,
      error: false,
      errorMessage: undefined,
    };
    this.toggleShowPassword = this.toggleShowPassword.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.cancelErrorMessage = this.cancelErrorMessage.bind(this);
  }

  handleUsernameChange(e) {
    this.setState({ username: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const newUser = {
      username: this.state.username,
      password: this.state.password,
    };

    try {
      // const res = await API.put(`/users/${this.props.user?._id}`, newUser, {
      await API.put(`/users/${this.props.user?._id}`, newUser, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      // console.log(res.data)
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

  cancelErrorMessage() {
    this.setState({
      error: false,
      errorMessage: undefined,
    });
  }

  toggleShowPassword() {
    this.setState({ showPassword: !this.state.showPassword });
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={() => {
          this.props.toggle();
          this.cancelErrorMessage();
        }}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update User</Modal.Title>
        </Modal.Header>

        <form onSubmit={this.handleSubmit} id="updateForm" autoComplete="off">
          <Modal.Body>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-person-circle"></i>
              </span>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder={this.props.user?.username}
                onChange={this.handleUsernameChange}
              />
            </div>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-key-fill"></i>
              </span>
              <input
                type={this.state.showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="Enter new password here"
                onChange={this.handlePasswordChange}
              />
              <div onMouseEnter={this.toggleShowPassword} onMouseLeave={this.toggleShowPassword}>
                <button type="button" className="btn" disabled>
                  <i className={`bi ${this.state.showPassword ? "bi-eye" : "bi-eye-slash"}`} />
                </button>
              </div>
            </div>
            {this.state.error && <div className="text-danger">{this.state.errorMessage}</div>}
          </Modal.Body>

          <Modal.Footer>
            <input className="btn btn-md btn-primary" type="submit" value="Update" style={{ float: "right" }} />
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

class DeleteUserPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: undefined,
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
  }

  componentDidUpdate() {
    // reset this.state.name when close pop up
    if (!this.props.show && this.state.username) {
      this.setState({ username: undefined });
    }
  }

  handleUsernameChange(e) {
    this.setState({ username: e.target.value });
  }

  async handleDelete(e) {
    e.preventDefault();

    try {
      await API.delete(`/users/${this.props.user?._id}`, {
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
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>

        <form onSubmit={this.handleDelete} autoComplete="off">
          <Modal.Body>
            <div>
              To delete the user <b>{this.props.user?.username}</b>, type the username to confirm.
            </div>
            <input
              type="text"
              className="form-control mt-2"
              name="username"
              placeholder="Enter username"
              onChange={this.handleUsernameChange}
            />
          </Modal.Body>

          <Modal.Footer>
            <button
              disabled={this.state.username !== this.props.user?.username}
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

export default User;
