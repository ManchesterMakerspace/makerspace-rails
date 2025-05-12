import * as React from "react";
import { NewReport, createEarnedMembershipReport, getMember, getEarnedMembership } from "makerspace-ts-api-client";


import Form from "ui/common/Form";
import { ReportForm } from "ui/reports/ReportForm";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { useAuthState } from "../reducer/hooks";
import useReadTransaction from "../hooks/useReadTransaction";
import useModal from "../hooks/useModal";
import { ActionButton } from "../common/ButtonRow";

interface Props {
  onCreate: () => void;
}
const CreateReport: React.FC<Props> = ({ onCreate }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const formRef = React.useRef<ReportForm>();
  const { currentUser: { id: currentUserId, earnedMembershipId } } = useAuthState();

  const {
    isRequesting: memberLoading,
    error: memberError,
    refresh: refreshMember,
    data: member,
  } = useReadTransaction(getMember, { id: currentUserId });

  const {
    isRequesting: loadingEM,
    error: errorEM,
    data: earnedMembership,
    refresh: refreshEM
  } = useReadTransaction(getEarnedMembership, { id: earnedMembershipId });

  const onSuccess = React.useCallback(({ reset }) => {
    refreshMember();
    refreshEM();
    onCreate();
    closeModal();
    reset();
  }, [closeModal, onCreate, refreshMember, refreshEM]);

  const {
    isRequesting: reportCreating,
    error: reportError,
    call: createReport
  } = useWriteTransaction(createEarnedMembershipReport, onSuccess);


  const loading = reportCreating || memberLoading || loadingEM;
  const error = reportError || memberError || errorEM;

  const onSubmit = React.useCallback(async (form: Form) => {
    const validUpdate: NewReport = await formRef.current.validate(form);

    if (!form.isValid()) return;

    return await createReport({ id: earnedMembershipId, body: validUpdate });
  }, [createReport, formRef]);

  return (
    <>
      <ActionButton
        id="report-list-create"
        color="primary"
        variant="contained"
        disabled={loading}
        label="Submit new report"
        onClick={openModal}
      />
      {isOpen && (
        <ReportForm
          ref={formRef}
          membership={earnedMembership}
          member={member}
          isOpen={true}
          isRequesting={loading}
          error={error}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default CreateReport;
