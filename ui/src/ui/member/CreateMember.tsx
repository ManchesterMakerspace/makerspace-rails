import * as React from "react";
import { Member, adminCreateMember, NewMember } from "makerspace-ts-api-client";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { ActionButton } from "../common/ButtonRow";
import useModal from "../hooks/useModal";
import Form from "../common/Form";
import { useAuthState } from "../reducer/hooks";
import MemberForm from "./MemberForm";


const CreateMember: React.FC<{ onCreate: (id: string) => void }> = ({ onCreate }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const { currentUser: { isAdmin } } = useAuthState();
  const formRef = React.useRef<MemberForm>();

  const onSuccess = React.useCallback(({ response }) => {
    onCreate(response.data.id);
    closeModal();
  }, [onCreate, closeModal]);
  const {
    isRequesting,
    error,
    call: create,
  } = useWriteTransaction(adminCreateMember, onSuccess);

  const onSubmit = React.useCallback(async (form: Form) => {
    const validUpdate: Record<string, any> = await formRef.current.validate(form);

    if (!form.isValid()) return;

    const { street, unit, city, state, postalCode, ...rest } = validUpdate;

    create({ body: {
      ...rest as NewMember,
      address: {
        street,
        unit,
        city,
        state,
        postalCode
      }
    }});
  }, [formRef, create]);

  return (
    <>
      <ActionButton
        id="members-list-create"
        color="primary"
        variant="contained"
        disabled={isRequesting}
        label="Create New Member"
        onClick={openModal}
      />
      {isOpen && (
        <MemberForm
          ref={formRef}
          isAdmin={isAdmin}
          isOpen={true}
          isRequesting={isRequesting}
          error={error}
          onClose={closeModal}
          onSubmit={onSubmit}
          title="Create New Member"
        />
      )}
    </>
  );
}

export default CreateMember;
