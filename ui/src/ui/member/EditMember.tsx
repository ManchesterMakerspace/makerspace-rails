import * as React from "react";
import { adminUpdateMember, Member, updateMember } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import Form from "../common/Form";
import { useAuthState } from "../reducer/hooks";
import MemberForm from "./MemberForm";


const EditMember: React.FC<{ member: Member, onEdit?: () => void; formOnly?: boolean }> = ({ member = {} as Member, formOnly, onEdit }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const { currentUser: { isAdmin } } = useAuthState();
  const formRef = React.useRef<MemberForm>();

  const onSuccess = React.useCallback(() => {
    closeModal();
    onEdit && onEdit();
  }, [onEdit, closeModal]);
  const {
    isRequesting: memberUpdating,
    error: updateError,
    call: update,
  } = useWriteTransaction(isAdmin ? adminUpdateMember : updateMember, onSuccess);

  const onSubmit = React.useCallback(async (form: Form) => {
    const validUpdate: Record<string, any> = await formRef.current.validate(form);

    if (!form.isValid()) return;

    const { street, unit, city, state, postalCode, ...rest } = validUpdate;

    update({ id: member.id, body: {
      ...rest,
      address: {
        street,
        unit,
        city,
        state,
        postalCode
      }
    } });
  }, [formRef, update]);

  return (
    <>
      {!formOnly && (
        <ActionButton
          id="member-detail-open-edit-modal"
          color="primary"
          variant="outlined"
          disabled={!member.id}
          label="Edit"
          onClick={openModal}
        />
      )}
      {(isOpen || formOnly) && (
        <MemberForm
          ref={formRef}
          member={member}
          isAdmin={isAdmin}
          isOpen={true}
          isRequesting={memberUpdating}
          error={updateError}
          onClose={closeModal}
          onSubmit={onSubmit}
          noDialog={formOnly}
        />
      )}
    </>
  );
}

export default EditMember;
