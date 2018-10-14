import * as moment from "moment";
import { Rental } from "app/entities/rental";

export const defaultRental: Rental = {
  id: "test-rental",
  number: "test",
  expiration: parseInt(moment().add(1, "months").calendar().valueOf()),
  memberId: "test_member"
};

export const defaultRentals: Rental[] = new Array(20).fill(undefined).map((_v, index) => {
  const expirationNum = (Date.now() % 6);
  let expirationTime: number;
  switch (expirationNum) {
    case 0:
      expirationTime = parseInt(moment().subtract(1, "months").calendar().valueOf())
    case (4 || 5):
      expirationTime = parseInt(moment().add(3, "months").calendar().valueOf())
      break;
    case (1 || 2 || 3):
      expirationTime = parseInt(moment().add(1, "months").calendar().valueOf())
      break;
  }
  return {
    ...defaultRental,
    id: `test_rental_${index}`,
    number: `${index}`,
    expiration: expirationTime,
    memberId: `test_member_${index}`
  }
});
