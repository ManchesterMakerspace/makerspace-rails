import * as moment from "moment-timezone";
// User's timezone
const defaultTZ = moment.tz.guess();

// Format ms since epoch to string to display
export const timeToDate = (time: number | string | Date) => {
  return moment(time).format("DD MMM YYYY");
};

// Format ms since epoch to string to that is supported by HTML5 date picker
export const toDatePicker = (time: number | string | Date) => {
  return moment(time).format("YYYY-MM-DD");
};

// Format selected date in UTC to be relative to user's timezone
export const dateToTime = (date: number | string | Date): number => {
  return moment(date, "YYYY-MM_DD", defaultTZ).valueOf();
};
