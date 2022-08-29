/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import React, { Component } from "react";
import _ from "lodash";
import { Modal } from "react-bootstrap";

class CreateButton extends Component {
  //passed props
  //toggle: toggle pop up functions
  render() {
    const { toggle } = this.props;
    return (
      <button className="btn btn-primary m-2" onClick={toggle}>
        <span className="mr-2">CREATE</span>
        <i className="bi bi-plus"></i>
      </button>
    );
  }
}

class ModalTemplate extends Component {
  //passed props
  //show: to show the modal or not
  //toggle: the action to show or hide the modal
  //title: Modal title
  //bodyElement: the body element of modal.body
  render() {
    const { show, toggle, title, bodyElement } = this.props;
    return (
      <Modal show={show} onHide={toggle} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{bodyElement}</Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={toggle}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class FormTemplate extends Component {
  //passed props
  //submitData: [onSubmit, formId, submitValue]
  //errorData: [error, errorMessage]
  //inputData: array of input elements [field, name, type, placeholder, required, onChange]
  render() {
    const { submitData, inputData, errorData } = this.props;
    return (
      <form onSubmit={submitData.submit} id={submitData.formId}>
        {inputData.map((input) => {
          return (
            <div className="input-group mb-3" key={input.field}>
              <span className="input-group-text">{input.field}</span>
              <input className="form-control" {...input} />
            </div>
          );
        })}
        {errorData.error && <div className="text-danger">{errorData.errorMessage}</div>}
        <input
          className="btn btn-md btn-primary"
          type="submit"
          value={submitData.submitValue}
          style={{ float: "right" }}
        />
      </form>
    );
  }
}

class TableHeader extends Component {
  //passed props
  //columns: [table column headers]
  render() {
    const { columns, onSort, icon } = this.props;
    return (
      <thead>
        <tr>
          {columns.map((column) => {
            return (
              <th className={column.className} onClick={() => onSort(column.path)} key={column.label}>
                {column.label}
                {icon}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }
}

class TableBody extends Component {
  render() {
    const { data, columns } = this.props;
    return (
      <tbody>
        {data.map((item) => {
          return (
            <tr key={item.name}>
              {columns.map((column) => {
                return <td key={column.label}>{this.renderCell(item, column)}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    );
  }

  renderCell = (item, column) => {
    if (column.content) return column.content(item);
    return _.get(item, column.path);
  };
}

class DetailsButton extends Component {
  render() {
    const { toggleRedirect } = this.props;
    return (
      <>
        <button type="button" className="btn btn-info" onClick={toggleRedirect}>
          <span className="mr-2">Details</span>
          <i className="bi bi-book"></i>
        </button>
      </>
    );
  }
}

class BookmarkButton extends Component {
  render() {
    const { buttonName, buttonIcon, toggle } = this.props;
    return (
      <>
        <button type="button" className="btn btn-secondary" onClick={toggle}>
          <span className="mr-2">{buttonName}</span>
          <i className={buttonIcon}></i>
        </button>
      </>
    );
  }
}

class EditButton extends Component {
  render() {
    return (
      <>
        <button type="button" className="btn btn-warning" onClick={this.props.toggle}>
          <span className="mr-2">Edit</span>
          <i className="bi bi-pen"></i>
        </button>
      </>
    );
  }
}

class DeleteButton extends Component {
  render() {
    return (
      <>
        <button type="button" className="btn btn-danger" onClick={this.props.toggle}>
          <span className="mr-2">Delete</span>
          <i className="bi bi-trash"></i>
        </button>
      </>
    );
  }
}

export {
  CreateButton,
  ModalTemplate,
  FormTemplate,
  TableHeader,
  TableBody,
  DetailsButton,
  BookmarkButton,
  EditButton,
  DeleteButton,
};
