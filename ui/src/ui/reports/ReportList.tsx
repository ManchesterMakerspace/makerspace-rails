import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import useReactRouter from "use-react-router";

import { Report, listEarnedMembershipReports, getMember, getEarnedMembership, adminGetEarnedMembership, adminListEarnedMembershipReports } from "makerspace-ts-api-client";

import { SortDirection } from "ui/common/table/constants";
import { timeToDate } from "ui/utils/timeToDate";
import { ReportForm } from "ui/reports/ReportForm";
import CreateReport from "./CreateReport";
import useReadTransaction from "../hooks/useReadTransaction";
import extractTotalItems from "../utils/extractTotalItems";
import useModal from "../hooks/useModal";
import { useAuthState } from "../reducer/hooks";
import StatefulTable from "../common/table/StatefulTable";
import { withQueryContext, useQueryContext } from "../common/Filters/QueryContext";

const getFields = (openDetails: (id: string) => void) => ([
  {
    id: "date",
    label: "Created",
    cell: (row: Report) => timeToDate(row.date),
    defaultSortDirection: SortDirection.Desc
  },
  {
    id: "view",
    label: "",
    cell: (row: Report) => <Button onClick={() => openDetails(row.id)}>View Report</Button>
  },
]);

const rowId = (report: Report) => report.id;

const ReportsTable: React.FC<{ earnedMembershipId: string }> = ({ earnedMembershipId }) => {
  const [selectedId, setSelectedId] = React.useState<string>();

  const { params, changePage } = useQueryContext();
  const { isOpen, openModal, closeModal } = useModal();
  const { currentUser: { id: currentUserId, isAdmin } } = useAuthState();
  const { match: { params: { memberId } } } =  useReactRouter<{ memberId: string }>();
  const isOwnMembership = currentUserId === memberId;
  const asAdmin = isAdmin && !isOwnMembership

  const setSeleted = React.useCallback((ids: string[]) => {
    setSelectedId(Array.isArray(ids) && ids[0] || undefined);
  }, [setSelectedId]);
  const {
    data: member
  } = useReadTransaction(getMember, { id: memberId });
  const {
    data: earnedMembership
  } = useReadTransaction(asAdmin ? adminGetEarnedMembership : getEarnedMembership, { id: earnedMembershipId});

  const adminEMResponse = useReadTransaction(adminListEarnedMembershipReports, { id: earnedMembershipId, ...params }, !asAdmin);
  const emResponse = useReadTransaction(listEarnedMembershipReports, { id: earnedMembershipId, ...params }, asAdmin);
  const {
    isRequesting,
    error,
    data: reports = [],
    response,
    refresh,
  } = asAdmin ? adminEMResponse : emResponse;


  const onCreate = React.useCallback(() => {
    refresh();
    changePage(0);
  }, [refresh, changePage])

  const openDetails = React.useCallback(reportId => {
    setSelectedId(reportId);
    openModal();
  }, [openModal, setSelectedId]);


  const selectedReport = reports.find(report => selectedId === report.id);

  return (
    <Grid container spacing={3} justify="center">
      <Grid item md={memberId ? 12 : 10} xs={12}>
        {isOwnMembership && <CreateReport onCreate={onCreate} />}
        <StatefulTable
          id="membership-reports-table"
          title="Earned Membership Reports"
          loading={isRequesting}
          data={Object.values(reports)}
          error={error}
          totalItems={extractTotalItems(response)}
          selectedIds={[selectedId]}
          setSelectedIds={setSeleted}
          columns={getFields(openDetails)}
          rowId={rowId}
        />
        {isOpen && (
          <ReportForm
            membership={earnedMembership}
            member={member}
            report={selectedReport}
            isOpen={true}
            isRequesting={isRequesting}
            error={error}
            onClose={closeModal}
            disabled={true}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default withQueryContext(ReportsTable);
