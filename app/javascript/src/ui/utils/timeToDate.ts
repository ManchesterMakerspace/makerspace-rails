import * as moment from "moment";

export const timeToDate = (time: number | string) => {
  return moment(time).format("DD MMM YYYY")
};
