import { MemberRole, MemberStatus } from "app/entities/member";
import { LoginMember } from "../pageObjects/auth";
import * as moment from "moment";

export const basicUser: LoginMember = {
  id: "test_member",
  firstname: "Test",
  lastname: "Member",
  email: "test_member@test.com",
  password: "password",
  role: MemberRole.Member,
  status: MemberStatus.Active,
  cardId: "test_member_card_1",
  expirationTime: (moment().add(1, "months").valueOf()),
  memberContractOnFile: true,
  customerId: "test_customer_1",
};
export const adminUser: LoginMember = {
  id: "admin_member",
  firstname: "Admin",
  lastname: "Member",
  email: "admin_member@test.com",
  password: "password",
  role: MemberRole.Admin,
  status: MemberStatus.Active,
  cardId: "admin_member_card_1",
  expirationTime: (moment().add(1, "months").valueOf()),
  memberContractOnFile: true,
  customerId: "test_admin_customer_1",
};
export const defaultMembers: LoginMember[] = new Array(20).fill(undefined).map((_v, index) => {
  const expirationNum = (Date.now() % 6);
  let expirationTime: number;
  switch (expirationNum) {
    case 0:
      expirationTime = (moment().subtract(1, "months").valueOf())
      break;
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
  if (index%5 === 0){
    return {
      ...adminUser,
      id: `admin_member_${index}`,
      firstname: "Member",
      lastname: `Admin ${index}`,
      email: `admin_member_${index}@test.com`,
      cardId: `admin_member_${index}_card 1`,
      expirationTime
    }
  }
  return {
    ...basicUser,
    id: `test_member_${index}`,
    firstname: "Member",
    lastname: `Test ${index}`,
    email: `test_member_${index}@test.com`,
    cardId: `test_member_${index}_card 1`,
    expirationTime
  }
});

export const basicMembers = defaultMembers.filter((member) => member.role == MemberRole.Member);
export const adminMembers = defaultMembers.filter((member) => member.role == MemberRole.Admin);
