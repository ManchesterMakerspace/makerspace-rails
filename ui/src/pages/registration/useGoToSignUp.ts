import * as React from 'react';
import { InvoiceOption } from 'makerspace-ts-api-client';
import { Routing } from "app/constants";
import { discountParam, invoiceOptionParam } from './MembershipOptions/constants';
import { useSetSearchQuery } from 'hooks/useSearchQuery';
 
export const useGoToSignUp = () => {
  const setSearchQuery = useSetSearchQuery({
    pathname: Routing.SignUp
  });
 
  return React.useCallback((option?: InvoiceOption, discountId?: string) => {
    setSearchQuery({
      [invoiceOptionParam]: option?.id,
      [discountParam]: discountId
    });
  }, [setSearchQuery]);
};
