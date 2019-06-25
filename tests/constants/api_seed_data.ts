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

export const invoiceOptionIds = {
  monthly: "one-month",
  quarterly: "three-months",
  annualy: "one-year"
};

export const resetDb = async () => {
  const cp = require('child_process');
  return new Promise(resolve => {
    cp.exec('RAILS_ENV=test bundle exec rake db:db_reset', (error: Error) => {
      if (error) {
        console.log(error);
      }
      resolve();
    });
  });
};

export const createRejectCard = (cardNumber: string) => {
  const cp = require('child_process');
  return new Promise(resolve => {
    cp.exec(`RAILS_ENV=test bundle exec rake db:reject_card["${cardNumber}"]`, (error: Error) => {
      if (error) {
        console.log(error);
      }
      resolve();
    })
  })
};

export const creditCardNumbers = {
  visa: "4111111111111111",
  mastercard: "5555555555554444",
  amex: "378282246310005",
  discover: "6011111111111117",
  debit: "4012000033330125",
  invalid: "4000111111111115",
};
