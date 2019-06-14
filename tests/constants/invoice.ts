import * as moment from "moment";
import { Invoice, InvoiceOperation, InvoiceOption, InvoiceableResource } from "app/entities/invoice";
export const defaultBillingOptions: InvoiceOption[] = [
  {
    id: "standard_membership",
    name: "Standard",
    description: "Standard Membership Subscription",
    amount: 65,
    quantity: 1,
    discountId: undefined,
    planId: "standard_membership",
    resourceClass: InvoiceableResource.Membership,
    operation: InvoiceOperation.Renew,
    disabled: false,
  }, {
    id: "foo",
    name: "Foo",
    description: "Foo Membership",
    amount: 10000,
    quantity: 1,
    planId: "foo",
    discountId: undefined,
    disabled: false,
    resourceClass: InvoiceableResource.Rental,
    operation: InvoiceOperation.Renew,
  }, {
    id: "bar",
    name: "Bar",
    description: "Bar Membership",
    amount: 45,
    quantity: 1,
    planId: "bar",
    discountId: undefined,
    resourceClass: InvoiceableResource.Rental,
    operation: InvoiceOperation.Renew,
    disabled: false,
  }
];
export const defaultBillingOption = defaultBillingOptions[0];

export const baseInvoice: Invoice = {
  id: "foo",
  name: "random membership invoice",
  description: "Some more details about this membership invoice",
  memberName: "Some dude",
  amount: 50,
  quantity: 1,
  settled: false,
  pastDue: false,
  refunded: false,
  resourceClass: InvoiceableResource.Membership,
  memberId: "test_member",
  operation: InvoiceOperation.Renew,
  resourceId: "123",
  createdAt: "Some time",
  dueDate: moment().add(1, "months").calendar(),
  resource: undefined
}
export const defaultInvoice: Invoice = {
  ...baseInvoice,
  id: "foo-default"
};
export const pastDueInvoice: Invoice = {
  ...baseInvoice,
  id: "foo-pastdue",
  description: "past due membership invoice",
  pastDue: true,
};
export const settledInvoice: Invoice = {
  ...baseInvoice,
  id: "foo-settled",
  description: "settled membership invoice",
  settled: true,
};
export const defaultInvoices: Invoice[] = new Array(20).fill(undefined).map((_v, index) => {
  return {
    ...defaultInvoice,
    id: `invoice-${index}`,
    description: `membership invoice number ${index}`,
    contact: `test_member-${index}.test.com`,
  }
})
export const membershipOptionQueryParams = {
  types: [InvoiceableResource.Membership]
};