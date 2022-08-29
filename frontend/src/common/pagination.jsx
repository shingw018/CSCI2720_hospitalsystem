/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

import { Component } from "react";
import _ from "lodash";

class Pagination extends Component {
  render() {
    const { itemsCount, pageSize, currentPage, onPageChange } = this.props;
    const pagesCount = Math.ceil(itemsCount / pageSize);
    if (pagesCount === 1) return null;
    const pages = _.range(1, pagesCount + 1);

    return (
      <nav>
        <ul className="pagination">
          {pages.map((page) => {
            return (
              <li className={page === currentPage ? "page-item active" : "page-item"} key={page}>
                <div className="page-link" onClick={() => onPageChange(page)}>
                  {page}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
}

export default Pagination;
