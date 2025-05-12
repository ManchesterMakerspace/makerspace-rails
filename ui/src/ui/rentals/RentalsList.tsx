import * as React from "react";
import moment from "moment";
import { Link } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";
import { Rental, listRentals, adminListRentals, Member } from "makerspace-ts-api-client";

import StatefulTable from "../common/table/StatefulTable";
import { SortDirection } from "ui/common/table/constants";
import { Column } from "ui/common/table/Table";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";
import { timeToDate } from "ui/utils/timeToDate";
import DeleteRentalModal from "ui/rentals/DeleteRentalModal";
import useReadTransaction from "ui/hooks/useReadTransaction";
import CreateRental from "ui/rentals/CreateRental";
import RenewRental from "ui/rentals/RenewRental";
import EditRental from "ui/rentals/EditRental";
import extractTotalItems from "../utils/extractTotalItems";
import { useAuthState } from "../reducer/hooks";
import { useQueryContext, withQueryContext } from "../common/Filters/QueryContext";

const rowId = (rental: Rental) => rental.id;

const RentalsList: React.FC<{ member?: Member }> = ({ member }) => {
  const { currentUser: { id, isAdmin } } = useAuthState();
  const asAdmin = isAdmin && id !== (member && member.id);

  const fields: Column<Rental>[] = [
    {
      id: "number",
      label: "Number",
      cell: (row: Rental) => row.number,
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "description",
      label: "Description",
      cell: (row: Rental) => row.description,
    },
    {
      id: "expiration",
      label: "Expiration Date",
      cell: (row: Rental) => row.expiration ? timeToDate(row.expiration) : "N/A",
      defaultSortDirection: SortDirection.Desc,
    },
    ...asAdmin ? [{
      id: "member",
      label: "Member",
      cell: (row: Rental) => <Link to={`/members/${row.memberId}`}>{row.memberName}</Link>,
      defaultSortDirection: SortDirection.Desc,
      width: 200
    }] : [],
    {
      id: "status",
      label: "Status",
      cell: (row: Rental) => {
        const current = moment(row.expiration).valueOf() > Date.now();
        const statusColor = current ? Status.Success : Status.Danger;
        const label = current ? "Active" : "Expired";

        return (
          <StatusLabel label={label} color={statusColor} />
        );
      },
    }
  ];

  const [selectedId, setSelectedId] = React.useState<string>();
  const { params, changePage } = useQueryContext();

  const adminListRentalsResponse = useReadTransaction(adminListRentals, {
    ...params,
    ...member && { memberId: member.id }
  }, !isAdmin);
  const listRentalsResposne = useReadTransaction(listRentals, {}, isAdmin, "rentals-list");

  const { isRequesting, data: rentals = [], response, refresh, error } = isAdmin
    ? adminListRentalsResponse
    : listRentalsResposne;

  const onRenew = React.useCallback(() => {
    refresh();
  }, [refresh]);
  const onEdit = React.useCallback(() => {
    refresh();
    setSelectedId(null);
  }, [refresh, setSelectedId]);
  const onDelete = React.useCallback(() => {
    refresh();
    changePage(0);
    setSelectedId(null);
  }, [refresh, changePage, setSelectedId]);

  const selectedRental = rentals.find(rental => rental.id === selectedId);

  return (
    <Grid container spacing={3} justify="center">
      <Grid item md={member ? 12 : 10} xs={12}>
        {isAdmin && (
          <Grid>
            <CreateRental onCreate={onRenew} member={member} />
            <EditRental rental={selectedRental} onUpdate={onEdit} />
            <RenewRental rental={selectedRental} onRenew={onRenew} />
            <DeleteRentalModal rental={selectedRental} onDelete={onDelete} />
          </Grid>
        )}

        <StatefulTable
          id="rentals-table"
          title="Rentals"
          loading={isRequesting}
          data={Object.values(rentals)}
          error={error}
          totalItems={extractTotalItems(response)}
          selectedIds={selectedId}
          setSelectedIds={setSelectedId}
          columns={fields}
          rowId={rowId}
          renderSearch={true}
        />
      </Grid>
    </Grid>
  );
};

export default withQueryContext(RentalsList);
