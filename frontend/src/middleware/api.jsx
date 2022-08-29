/*
 * CSCI2720 Group20 Project Members List
 * SZETO Win Key    (1155109549)
 * CHEUNG Kam Fung  (1155110263)
 * WONG Shing       (1155109027)
 * IP Shing On      (1155109011)
 */

// A tool used for calling backend API
import axios from "axios";

export default axios.create({
  // for local use
  // baseURL: `http://localhost:2030/api`,

  // for vm
  baseURL: `http://csci2720-g30.cse.cuhk.edu.hk/api`,
  withCredentials: true,
  // credentials: "included",
});
