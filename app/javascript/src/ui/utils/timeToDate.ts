import moment from "moment";

export const timeToDate = (time: number | string | Date) => {
  return moment(time).format("DD MMM YYYY")
};
