import { resolve } from "dns";

export const basicUserLogins = new Array(5).fill(undefined).map((_, index) => ({
  email: `basic_member${index}@test.com`,
  password: "password"
}));
export const getBasicUserLogin = () => basicUserLogins.length && basicUserLogins.pop();

export const adminUserLogins = new Array(5).fill(undefined).map((_, index) => ({
  email: `admin_member${index}@test.com`,
  password: "password"
}));
export const getAdminUserLogin = () => adminUserLogins.length && adminUserLogins.pop();

export const invoiceOptionIds = ["one-month", "three-months", "one-year"];

export const createRejectCard = (cardNumber: string) => {
  const cp = require('child_process');
  return new Promise(resolve => {
    cp.exec(`RAILS_ENV=test rails db:reject_card["${cardNumber}"]`, (error: Error) => {
      if (error) {
        console.log(error);
      }
      console.log("SUCCESS", cardNumber);
      resolve();
    })
  })
}