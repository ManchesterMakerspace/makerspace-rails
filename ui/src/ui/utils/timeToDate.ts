import moment from "moment-timezone";
// User's timezone
const defaultTZ = "America/New_York";

// Format ms since epoch to string to display
export const timeToDate = (time: number | string | Date) => {
  return time && moment.tz(time, defaultTZ).format("DD MMM YYYY");
};

// Format ms since epoch to string to that is supported by HTML5 date picker
export const toDatePicker = (time: number | string | Date) => {
  return time && moment.tz(time, defaultTZ).format("YYYY-MM-DD");
};

// Format selected date in UTC to be relative to user's timezone
export const dateToTime = (date: string): number => {
  return date && moment.tz(date, "YYYY-MM-DD", defaultTZ).valueOf();
};

export const dateToMidnight = (date: string | number | Date): string => {
  const asDate = new Date(date);
  // Normalize to midnight of the next day
  asDate.setUTCHours(24, 0, 0, 0);
  return date && asDate.toUTCString();
}