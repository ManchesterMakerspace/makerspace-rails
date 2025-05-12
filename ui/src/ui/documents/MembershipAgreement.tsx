import * as React from "react";
import SignatureCanvas from "react-signature-canvas";
import { updateMember } from "makerspace-ts-api-client";
import Grid from "@material-ui/core/Grid";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMore from "@material-ui/icons/ExpandMore";
import DocumentFrame, { documents, Documents } from "ui/documents/Document";
import { Form } from "components/Form/Form";
import { SignatureBlock } from "ui/documents/SignatureBlock";
import useWriteTransaction from "ui/hooks/useWriteTransaction";
import { useAuthState } from "ui/reducer/hooks";
import { CheckboxInput } from "components/Form/inputs/CheckboxInput";
import { FormField } from "components/Form/FormField";

interface Props {
  onSuccess?(): void;
  hideFooter?: boolean;
}

const { 
  [Documents.CodeOfConduct]: codeOfConduct,
  [Documents.MemberContract]: memberContract,
} = documents;

export const MembershipAgreement: React.FC<Props> = ({ onSuccess, hideFooter, children }) => {
  const [signatureRef, setSignatureRef] = React.useState<SignatureCanvas>();
  const { currentUser: { id: currentUserId } } = useAuthState();

  const {
    isRequesting: updating,
    error,
    call: update
  } = useWriteTransaction(updateMember, onSuccess);

  const onSubmit = React.useCallback(async () => {
    await update({ id: currentUserId, body: { signature: signatureRef.toDataURL() }});
    return true;
  }, [update, signatureRef, currentUserId]);

  return (
    <Form
      id={`agreements-form`}
      onSubmit={onSubmit}
      hideFooter={hideFooter}
      loading={updating}
      error={error}
      style={{ maxWidth: "900px", margin: "auto" }}
    >
      <Typography>Please review and accept the following makerspace documents.</Typography>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={{ backgroundColor: "#F6F6F6" }}
        >
          <Typography id="panel1a-content">Code of Conduct</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DocumentFrame {...codeOfConduct} src={String(codeOfConduct.src)} />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={true}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel2a-content"
          id="panel2a-header"
          style={{ backgroundColor: "#F6F6F6" }}
        >
          <Typography id="panel2a-content">Member Contract</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DocumentFrame {...memberContract} src={String(memberContract.src)} />
        </AccordionDetails>
      </Accordion>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CheckboxInput
            fieldName={codeOfConduct.name}
            required={true}
            label={codeOfConduct.label}
          />
        </Grid>

        <Grid item xs={12}>
          <CheckboxInput
            fieldName={memberContract.name}
            required={true}
            label={memberContract.label}
          />
        </Grid>

        <SignatureBlock takeSignature={setSignatureRef} />
        {children}
      </Grid>
    </Form>
  );
};
