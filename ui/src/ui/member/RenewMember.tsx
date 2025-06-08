import * as React from "react";
import { memberToRenewal } from "ui/member/utils";
import RenewalForm, { RenewForm } from "ui/common/RenewalForm";
import { adminUpdateMember, MemberSummary, Member } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import Form from "../common/Form";


const RenewMember: React.FC<{ member: Member | MemberSummary, onRenew: () => void }> = ({ member = {} as MemberSummary, onRenew }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const formRef = React.useRef<RenewalForm>();

  const onSuccess = React.useCallback(({ reset }) => {
    closeModal();
    onRenew();
    reset();
  }, [closeModal]);
  const {
    isRequesting: memberRenewing,
    error: renewError,
    call: renew,
  } = useWriteTransaction(adminUpdateMember, onSuccess);

  const onSubmit = React.useCallback(async (form: Form) => {
    const validUpdate: RenewForm = await formRef.current.validate(form);

    if (!form.isValid()) return;

    renew({ id: member.id, body: validUpdate });
  }, [formRef, renew, member]);

  return (
    <>
      <ActionButton
        id="members-list-renew"
        color="primary"
        variant="outlined"
        disabled={!member.id}
        label="Renew"
        onClick={openModal}
      />
      {isOpen && (
        <RenewalForm
          ref={formRef}
          title="Renew Membership"
          entity={memberToRenewal(member)}
          isOpen={true}
          isRequesting={memberRenewing}
          error={renewError}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}

export default RenewMember;
