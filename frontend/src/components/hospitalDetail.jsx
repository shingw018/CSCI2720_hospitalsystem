/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import React, { Component, Fragment } from "react";
import API from "../middleware/api";
import Cookies from "js-cookie";
import { Button, Modal, Spinner, ListGroup } from "react-bootstrap";
import { SmallMapContainer } from "./map";
import Chart from "./smallChart";
import { Redirect } from "react-router";

class ViewHospital extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hospital: {},
      comments: [],
      fetched: false,
      notFound: false,
    };
    this.toggleShowPopUp = this.toggleShowPopUp.bind(this);
    this.commentChild = React.createRef();
  }

  toggleShowPopUp() {
    this.setState({ showPopUp: !this.state.showPopUp });
  }

  onLeaveComment() {
    this.commentChild.current.getNewComments();
  }

  componentDidMount() {
    this.fetchHospital = this.fetchHospital.bind(this);
    this.fetchHospital();
  }

  async fetchHospital() {
    console.log("fetching");
    try {
      let hId = this.props.match.params.hId;

      const res = await API.get("hospitals/" + hId, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      console.log(res.data);

      this.setState({ comments: res.data.comments });
      delete res.data.comments;
      this.setState({ hospital: res.data, fetched: true });
      this.onLeaveComment();

      console.log("this.state.hospital");
      console.log(this.state.hospital);
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });
          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.fetchHospital();
        } else {
          console.log(err);
          this.setState({ notFound: true });
          this.fetchHospital();
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
            <h2>{this.state.hospital.name}</h2>
            <Chart hospital={this.state.hospital} />

            <br />
            <div className="card container-fluid">
              <div className="card-body">
                <div className="float-left" style={{ width: "700px", height: "300px" }}>
                  <SmallMapContainer hospital={this.state.hospital} />
                </div>
                <ListGroup>
                  <ListGroup.Item>District: {this.state.hospital.district}</ListGroup.Item>
                  <ListGroup.Item>Latitude: {this.state.hospital.latitude}</ListGroup.Item>
                  <ListGroup.Item>Longitude: {this.state.hospital.longitude}</ListGroup.Item>
                </ListGroup>
              </div>
            </div>

            <br />
            <div className="my-3">
              <button className="btn btn-primary" onClick={this.toggleShowPopUp}>
                <span className="mr-2">Comment</span>
                <i className="bi bi-plus"></i>
              </button>
              <LeaveCommentPopUp
                show={this.state.showPopUp}
                toggle={this.toggleShowPopUp}
                done={this.fetchHospital}
                hId={this.props.match.params.hId}
              />
            </div>

            <Comments ref={this.commentChild} done={this.fetchHospital} comments={this.state.comments} />
          </>
        )}
      </>
    );
  }
}

class LeaveCommentPopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
    };
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.cancelErrorMessage = this.cancelErrorMessage.bind(this);
  }

  handleContentChange(e) {
    this.setState({ content: e.target.value });
  }

  async handleSubmit(e) {
    e.preventDefault();
    //router.post('/:id/comments', checkId, async (req, res) => {

    const content = {
      content: this.state.content,
    };

    try {
      // const res = await API.post('hospitals/'+this.props.hId+'/comments', content, {
      await API.post("hospitals/" + this.props.hId + "/comments", content, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });
      // console.log("            this.props.done()")

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
          <Modal.Title>Leave Comment</Modal.Title>
        </Modal.Header>

        <form onSubmit={this.handleSubmit} id="createForm">
          <Modal.Body>
            <div className="input-group mb-3">
              <textarea
                rows="4"
                cols="50"
                name="comment"
                onChange={this.handleContentChange}
                required
                style={{ padding: 5 }}
              />
            </div>
            {this.state.error && <div className="text-danger">{this.state.errorMessage}</div>}
          </Modal.Body>

          <Modal.Footer>
            {/* <button type="button" className="btn btn-secondary" onClick={this.props.toggle}>
                            Close
                        </button> */}
            <input className="btn btn-md btn-primary" type="submit" value="Send" style={{ float: "right" }} />
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: this.props.comments,
    };
    this.getNewComments = this.getNewComments.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  getNewComments() {
    this.setState({ comments: this.props.comments });
  }

  async deleteComment(index) {
    console.log("this.state.comments[index]");

    console.log(this.state.comments[index]);
    try {
      await API.delete(`/comments/` + this.state.comments[index]._id, {
        headers: {
          Authorization: Cookies.get("accessToken"),
        },
      });

      this.props.done();
    } catch (err) {
      try {
        if (err.response?.data?.message === "FORBIDDEN") {
          const res = await API.post("/auth/token", {
            token: Cookies.get("refreshToken"),
          });

          Cookies.set("accessToken", res.data.accessToken, { sameSite: "Strict" });
          this.deleteComment(index);
        } else if (err.response?.data?.message === "Body invalid") {
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
      <>
        <div className="media">
          <div className="media-body">
            {this.state.comments.map((comment, index) => {
              return (
                <Fragment key={index}>
                  <div className="align-self-end mr-3 text-wrap">
                    {Cookies.get("username") === comment.sender.username || Cookies.get("username") === "admin" ? (
                      <>
                        <Button
                          className="float-right bg-danger"
                          style={{ border: "none" }}
                          onClick={() => this.deleteComment(index)}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <></>
                    )}
                    <h4>{comment.sender.username}</h4> <span>{new Date(comment.date).toLocaleString()}</span> <br />
                    <p className="text-wrap text-break">{comment.content}</p>
                  </div>
                  <hr />
                </Fragment>
              );
            })}
          </div>
        </div>
      </>
    );
  }
}

export default ViewHospital;
