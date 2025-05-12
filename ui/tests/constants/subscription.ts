import moment from "moment";
import { Subscription, SubscriptionStatusEnum } from "makerspace-ts-api-client";

export const defaultSubscription: Subscription = {
  id: "test-subscription",
  memberId: "test_member",
  memberName: "Some Member",
  resourceClass: "member",
  resourceId: "test_member",
  amount: "65",
  status: SubscriptionStatusEnum.Active,
  failureCount: 0,
  daysPastDue: 0,
  billingDayOfMonth: "1",
  firstBillingDate: new Date(moment().subtract(1, "months").valueOf()).toString(),
  nextBillingDate: new Date(moment().add(1, "months").valueOf()).toString(),
  planId: "foo",
  paymentMethodToken: "test-payment-method-token",
};

export const defaultSubscriptions: Subscription[] = new Array(20).fill(undefined).map((_v, index) => {
  const switchNum = (Date.now() % 6);
  let nextBillingDate: number;
  switch (switchNum) {
    case 0:
      nextBillingDate = (moment().subtract(1, "months").valueOf())
    case 4:
    case 5:
      nextBillingDate = (moment().add(3, "months").valueOf())
      break;
    case 1:
    case 2:
    case 3:
      nextBillingDate = (moment().add(1, "months").valueOf())
      break;
  }
  return {
    ...defaultSubscription,
    id: `test_subscription_${index}`,
    number: `${index}`,
    expiration: nextBillingDate,
    memberId: `test_member_${index}`
  }
});
