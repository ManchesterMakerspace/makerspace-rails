import * as moment from "moment";
import { Rental } from "app/entities/rental";

export const defaultRental: Rental = {
  id: "test-rental",
  number: "test",
  expiration: (moment().add(1, "months").valueOf()),
  memberId: "test_member",
  description: "foo",
  memberName: "Some Member",
};

export const defaultRentals: Rental[] = new Array(20).fill(undefined).map((_v, index) => {
  const expirationNum = (Date.now() % 6);
  let expirationTime: number;
  switch (expirationNum) {
    case 0:
      expirationTime = (moment().subtract(1, "months").valueOf())
    case 4:
    case 5:
      expirationTime = (moment().add(3, "months").valueOf())
      break;
    case 1:
    case 2:
    case 3:
      expirationTime = (moment().add(1, "months").valueOf())
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
