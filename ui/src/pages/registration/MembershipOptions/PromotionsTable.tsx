import * as React from 'react';
import { InvoiceOption } from 'makerspace-ts-api-client';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useMembershipOptions } from 'hooks/useMembershipOptions';
import TableContainer from 'ui/common/table/TableContainer';
import { numberAsCurrency } from 'ui/utils/numberAsCurrency';
import { invoiceOptionParam, promotionActionLabel } from './constants';
import { useSearchQuery } from 'hooks/useSearchQuery';
import { dateToMidnight } from 'ui/utils/timeToDate';

interface Props {
  onSelect(option: InvoiceOption): void;
}

export const PromotionsTable: React.FC<Props> = ({ onSelect }) => {
  const { promotionOptions, loading, error } = useMembershipOptions();
  const { membershipOptionId } = useSearchQuery({ membershipOptionId: invoiceOptionParam });

  const fields = React.useMemo(() =>  [
    {
      id: "name",
      label: "Name",
      cell: (row: InvoiceOption) => row.name
    },
    {
      id: "description",
      label: "Description",
      cell: (row: InvoiceOption) => 
        `${row.description.endsWith(".") ? row.description : `${row.description}.`} Promotion ends ${dateToMidnight(row.promotionEndDate)}`
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: InvoiceOption) => numberAsCurrency(row.amount)
    },
    {
      id: "select",
      label: "",
      cell: (row: InvoiceOption) => {
        const selected = membershipOptionId === row.id;
        const label = selected ? "Selected" : promotionActionLabel;
        const variant = (selected || !membershipOptionId) ? "contained" : "outlined";

        return (
          <Button id={row.id} variant={variant} color="primary" onClick={() => onSelect(row)}>
            <Typography noWrap={true}>{label}</Typography>
          </Button>
        );
      }
    }
  ], [membershipOptionId]);

  if (!promotionOptions.length) {
    return null;
  }

  return (
    <div className="membership-promotion-options">
      <TableContainer
        id="membership-promotion-select-table"
        title="Current Promotions"
        data={promotionOptions}
        columns={fields}
        loading={loading}
        error={error}
        rowId={(row: InvoiceOption) => row.id}
      />
    </div>
  );
 };
