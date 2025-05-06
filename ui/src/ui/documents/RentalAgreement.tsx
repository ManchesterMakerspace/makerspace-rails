import * as React from "react";
import useReactRouter from "use-react-router";
import Paper from "@material-ui/core/Paper";

import { updateRental } from "makerspace-ts-api-client";
import { buildProfileRouting } from "../member/utils";
import { useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import DocumentForm from "./DocumentForm";
import { Documents, documents } from "./Document";
import { useScrollToHeader } from "../hooks/useScrollToHeader";

const rentalAgreement = documents[Documents.RentalAgreement];

const RentalAgreement: React.FC<{ rentalId: string }> = ({ rentalId }) => {
  const { history } = useReactRouter();
  const { currentUser: { id: currentUserId } } = useAuthState();
  const { executeScroll } = useScrollToHeader();

  const onSuccess = React.useCallback(() => {
    executeScroll();
    history.push(buildProfileRouting(currentUserId));
  }, [history, executeScroll, currentUserId]);

  const {
    error,
    isRequesting: updating,
    call: update
  } = useWriteTransaction(updateRental, onSuccess);

  const onContractAccept = React.useCallback(async (signature: string) => {
    await update({ id: rentalId, body: { signature }});
  }, [update]);


  return (
    <Paper>
      <DocumentForm
        error={error}
        loading={updating}
        doc={{
          ...rentalAgreement,
          src: typeof rentalAgreement.src === "function" ? 
            rentalAgreement.src(rentalId) : rentalAgreement.src
        }}
        onAccept={onContractAccept}
        requestSignature={true}
      />
    </Paper>
  );
}

export default RentalAgreement;
