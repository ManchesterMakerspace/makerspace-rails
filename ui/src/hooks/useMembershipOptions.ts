
import * as React from "react";
import useReadTransaction from "ui/hooks/useReadTransaction";
import { InvoiceOption, listInvoiceOptions, InvoiceableResource, listBillingDiscounts, Discount } from "makerspace-ts-api-client";
import { byAmount, defaultPlanId, noneInvoiceOption } from "pages/registration/MembershipOptions";

interface ParsedInvoiceOptions {
  loading: boolean;
  error: string;
  promotionOptions: InvoiceOption[];
  normalOptions: InvoiceOption[];
  defaultOption: InvoiceOption;
  allOptions: InvoiceOption[];
  discounts: Discount[];
}

export const useMembershipOptions = (includeNone?: boolean): ParsedInvoiceOptions => {
  const {
    isRequesting,
    error,
    data: membershipOptions
  } = useReadTransaction(
    listInvoiceOptions, 
    { types: [InvoiceableResource.Member] },
    undefined,
    undefined,
    false
  );

  const { data: discounts } = useReadTransaction(listBillingDiscounts, {});

  return React.useMemo(() => {
    const promotionOptions: InvoiceOption[] = [];
    let defaultOption: InvoiceOption;

    const normalOptions = (membershipOptions || []).reduce((opts, option) => {
      if (option.planId === defaultPlanId) {
        defaultOption = option;
      }
      
      if (!option.disabled) {
        (option.isPromotion ? promotionOptions : opts).push(option);
      }
      return opts;
    }, [] as InvoiceOption[]);

    const sortedNormalOpts = normalOptions.sort(byAmount);
    
    return {
      error,
      loading: isRequesting,
      promotionOptions,
      discounts: discounts || [],
      normalOptions: sortedNormalOpts.concat(includeNone ? [noneInvoiceOption] : []),
      defaultOption: defaultOption || sortedNormalOpts[0],
      allOptions: promotionOptions.concat(sortedNormalOpts)
    };
  }, [membershipOptions, isRequesting, error, discounts]);
}