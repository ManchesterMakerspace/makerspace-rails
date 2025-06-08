import moment from "moment";
import { Transaction, TransactionStatusEnum } from "makerspace-ts-api-client";

export const defaultTransaction: Transaction = {
  id: "test-transaction",
  memberId: "test_member",
  memberName: "Some Member",
  createdAt: new Date().toString(),
  status: TransactionStatusEnum.Settled,
  amount: "65.00",
  recurring: false,
  disputes: [],
  discounts: [],
  discountAmount: "0.00",
  customerDetails: {},
  refundedTransactionId: null,
  refundIds: [],
  subscriptionDetails: {},
  paymentMethodDetails: {}
};

export const defaultTransactions: Transaction[] = new Array(20).fill(undefined).map((_v, index) => {
  const randomizer = (Date.now() % 6);
  let createdAt: number;
  switch (randomizer) {
    case 0:
      createdAt = (moment().subtract(1, "months").valueOf())
    case 4:
    case 5:
      createdAt = (moment().add(3, "months").valueOf())
      break;
    case 1:
    case 2:
    case 3:
      createdAt = (moment().add(1, "months").valueOf())
      break;
  }
  return {
    ...defaultTransaction,
    created_at: new Date(createdAt),
    id: `test_transaction_${index}`,
  }
});
