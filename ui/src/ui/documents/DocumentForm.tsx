import * as React from "react";
import SignatureCanvas from "react-signature-canvas";

import Grid from "@material-ui/core/Grid";

import { Form } from "components/Form/Form";
import DocumentFrame, { DocDetails } from "./Document";
import { SignatureBlock } from "./SignatureBlock";
import { CheckboxInput } from "components/Form/inputs/CheckboxInput";

interface Props {
  doc: DocDetails & { src: string };
  onAccept: (signature?: string) => void;
  requestSignature?: boolean;
  loading: boolean;
  error: string;
}

const DocumentForm: React.FC<Props> = ({ error, loading, onAccept, doc, requestSignature }) => {
  const { id, name, src, label } = doc;
  const [signatureRef, setSignatureRef] = React.useState<SignatureCanvas>();

  const onSubmit = React.useCallback(async () => {
    onAccept(signatureRef.toDataURL());
  }, [onAccept, signatureRef]);

  return (
    <Form
      key={id}
      id={`${id}-form`}
      submitText="Proceed"
      onSubmit={onSubmit}
      error={error}
      loading={loading}
      style={{ maxWidth: "900px", margin: "auto" }}
    >
      <DocumentFrame id={id} src={src} />
      <Grid item xs={12} style={{ marginTop: "1rem" }}>
        <CheckboxInput label={label} fieldName={name} required={true} />
      </Grid>

      {requestSignature && <SignatureBlock takeSignature={setSignatureRef} />}
    </Form>
  );
};

export default DocumentForm;
