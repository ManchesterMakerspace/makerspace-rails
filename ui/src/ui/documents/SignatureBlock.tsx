import * as React from "react";
import SignatureCanvas from "react-signature-canvas";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { FormField } from "components/Form/FormField";

interface Props {
  takeSignature(ref: SignatureCanvas): void;
}

export const SignatureBlock: React.FC<Props> = ({ takeSignature }) => {
  const [signatureRef, setSignatureRef] = React.useState<SignatureCanvas>();
  const clearSignature = React.useCallback(() => {
    signatureRef && signatureRef.clear();
  }, [signatureRef]);

  React.useEffect(() => {
    takeSignature(signatureRef)
  }, [signatureRef]);

  const validate = React.useCallback(() => {
    if (!signatureRef || signatureRef.isEmpty()) {
      return "Signature required to proceed";
    }
  }, [signatureRef]);
  
  return (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle1" align="left">Please sign below</Typography>
      </Grid>
      <Grid item xs={12} style={{ border: "1px solid black", borderRadius: "4px" }}>
        <SignatureCanvas ref={ref => setSignatureRef(ref)} canvasProps={{ height: "250", width: "1000" }} />
        <Grid container justify="flex-end">
          <Grid item xs={12}>
            <Button variant="contained" color="secondary" onClick={clearSignature}>Reset Signature</Button>
          </Grid>
        </Grid>
      </Grid>
      <FormField
        fieldName={"signature"}
        validate={validate}
      />
    </>
  );
};
