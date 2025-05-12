import { InvoiceOption } from "makerspace-ts-api-client";

export const noneInvoiceOption: InvoiceOption = {
  id: "none",
  name: "None",
  description: "Paid with cash or select an option later",
  amount: undefined,
  resourceClass: undefined,
  quantity: 0,
  disabled: false,
  isPromotion: false,
  planId: null,
  discountId: null
};

export const invoiceOptionParam = "optionId";
export const discountParam = "discountId";

export const byAmount = (a: InvoiceOption, b: InvoiceOption) => Number(a.amount) - Number(b.amount);
export const defaultPlanId = "membership-one-month-recurring";

export const promotionActionLabel = "Use Discount";
export const actionLabel = "Sign Up";
export const ssmDiscount = "MMS_10%";
