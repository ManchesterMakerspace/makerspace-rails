import * as React from 'react';
import { InvoiceOption } from 'makerspace-ts-api-client';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useMembershipOptions } from 'hooks/useMembershipOptions';
import TableContainer from 'ui/common/table/TableContainer';
import { numberAsCurrency } from 'ui/utils/numberAsCurrency';
import { actionLabel, invoiceOptionParam, noneInvoiceOption } from './constants';
import { useSearchQuery, useSetSearchQuery } from 'hooks/useSearchQuery';

interface Props {
  showNoneOption: boolean;
  onSelect(option: InvoiceOption): void;
}

export const MembershipOptionsTable: React.FC<Props> = ({ showNoneOption, onSelect }) => {
  const { normalOptions, loading, error } = useMembershipOptions(showNoneOption);
  const { membershipOptionId } = useSearchQuery({ membershipOptionId: invoiceOptionParam });
  const setSearchQuery = useSetSearchQuery();

  React.useEffect(() => {
    if (membershipOptionId) {
      const matchingOpt = normalOptions.find((opt) => 
        opt.id === membershipOptionId || opt.planId === membershipOptionId
      );

      // Normalize ID or names with URL
      if (matchingOpt) {
        setSearchQuery({ [invoiceOptionParam]: matchingOpt.id })
      }
    }
  }, [membershipOptionId, normalOptions, setSearchQuery]);

  const fields = React.useMemo(() =>  [
    {
      id: "name",
      label: "Name",
      cell: (row: InvoiceOption) => row.name
    },
    {
      id: "description",
      label: "Description",
      cell: (row: InvoiceOption) => row.description
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: InvoiceOption) => row.amount === undefined ? "N/A" : numberAsCurrency(row.amount)
    },
    {
      id: "select",
      label: "",
      cell: (row: InvoiceOption) => {
        const isNoneOption = row === noneInvoiceOption;
        const selected = membershipOptionId === row.id;
        const variant = selected ? "contained" : "outlined";
        const label = selected ? "Selected" : actionLabel;

        return (
          <Button 
            id={`membership-select-table-${row.id}-select-button`}
            variant={variant} 
            color="primary" 
            onClick={() => onSelect(row)}
          >
            <Typography noWrap={true}>{isNoneOption ? "Continue" : label}</Typography>
          </Button>
        );
      }
    }
  ], [membershipOptionId]);

  return (
    <TableContainer
      id="membership-select-table"
      title="Membership Options"
      loading={loading}
      error={error}
      data={normalOptions}
      columns={fields}
      rowId={(row: InvoiceOption) => row.id}
    />
  );
 };
