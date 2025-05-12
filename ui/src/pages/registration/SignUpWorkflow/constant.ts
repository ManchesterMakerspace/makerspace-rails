import { useMembershipOptions } from "hooks/useMembershipOptions";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { ssmDiscount } from "../MembershipOptions";

export function useTotal(invoiceAmount: number, discountId: string): string {
  const { discounts } = useMembershipOptions();
  const selectedDiscountAmt = discountId === ssmDiscount ? (0.1 * invoiceAmount) : discounts.find(d => d.id === discountId)?.amount;

  return invoiceAmount ? numberAsCurrency(invoiceAmount - (selectedDiscountAmt ? Number(selectedDiscountAmt) : 0)) : "-";
}