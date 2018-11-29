import * as React from "react";

import SignatureCanvas from "react-signature-canvas";

import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { AuthMember } from "ui/auth/interfaces";
import { timeToDate } from "ui/utils/timeToDate";
const codeOfConduct = require('code_of_conduct.html') as string;
const memberContract = require('member_contract.html') as string;
import Form from "ui/common/Form";
import LoadingOverlay from "ui/common/LoadingOverlay";

interface OwnProps {
  onSubmit: (signature: WindowBase64) => void;
  uploadError: string;
  uploadProcessing: boolean;
  currentUser: AuthMember;
}
interface Props extends OwnProps {}

interface State {
  display: Documents;
  acceptCodeOfConduct: boolean;
  acceptMemberContract: boolean;
  documentError: string;
}

enum Documents {
  codeOfConduct = "code_of_conduct",
  memberContract = "member_contract",
}

class SignDocuments extends React.Component<Props, State>{
  private signatureRef: any;
  private setSignatureRef = (ref: any) => this.signatureRef = ref;

  public constructor(props: Props) {
    super(props);
    this.state = {
      display: Documents.codeOfConduct,
      acceptCodeOfConduct: false,
      acceptMemberContract: false,
      documentError: ""
    }
  }

  // Make sure checkbox is checked, then switch to member contract
  private completeCodeOfConduct = async (form: Form) => {
    const documentField = this.documents()[Documents.codeOfConduct];

    await form.simpleValidate({ [Documents.codeOfConduct]: documentField });
    if (!form.isValid()) {
      this.setState({ documentError: documentField.error });
      return;
    }
    this.setState({ display: Documents.memberContract })
  }

  private getCodeOfConduct = () => {
    const document = this.documents()[Documents.codeOfConduct];
    return (
      <Form
        id="code-of-conduct-form"
        submitText="Proceed"
        onSubmit={this.completeCodeOfConduct}
        error={this.state.documentError}
      >
        {this.renderDocument(codeOfConduct)}
        <div key={document.name}>
          <FormControlLabel
            control={
              <Checkbox
                name={document.name}
                value={document.name}
                checked={document.value}
                onChange={this.acceptDocument(document.name)}
                color="primary"
              />
            }
            label={document.label}
          />
        </div>
      </Form>
    );
  }
  private getMemberContract = () => {
    const formattedMemberContract = memberContract.replace('[name]', `<b>${this.props.currentUser.firstname} ${this.props.currentUser.lastname}</b>`)
                                                  .replace('[today]', `<b>${timeToDate(new Date())}</b>`);
    const document = this.documents()[Documents.memberContract];
    return (
      <Form
        id="member-contract-form"
        submitText="Proceed"
        onSubmit={this.completeDocuments}
        error={this.state.documentError || this.props.uploadError}
      >
        {this.renderDocument(formattedMemberContract)}
        <div key={document.name}>
          <FormControlLabel
            control={
              <Checkbox
                name={document.name}
                checked={document.value}
                value={document.name}
                onChange={this.acceptDocument(document.name)}
                color="primary"
              />
            }
            label={document.label}
          />
        </div>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="subheading" align="left">Please sign below</Typography>
          </Grid>
          <Grid item xs={12} style={{ border: "1px solid black", borderRadius: "4px" }}>
            <SignatureCanvas ref={this.setSignatureRef} canvasProps={{ height: "250", width: "1000" }} />
            <Grid container justify="flex-end">
              <Grid item xs={12}>
                <Button variant="flat" color="secondary" onClick={this.clearSignature}>Reset Signature</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {this.props.uploadProcessing && <LoadingOverlay id="signature-loading-overlay"/> }
      </Form>
    );
  }

  private clearSignature = () => {
    this.signatureRef && this.signatureRef.clear();
  }

  // Handle checkbox state for document acceptance
  private acceptDocument = (acceptedDoc: Documents) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (acceptedDoc === Documents.codeOfConduct) {
      this.setState({ acceptCodeOfConduct: checked });
    } else if (acceptedDoc === Documents.memberContract) {
      this.setState({ acceptMemberContract: checked });
    }
  }
  // Verify signature and call submit callback
  private completeDocuments = async (form: Form) => {
    const documentField = this.documents()[Documents.memberContract];

    await form.simpleValidate({ [Documents.memberContract]: documentField });
    if (!form.isValid()) {
      this.setState({ documentError: documentField.error });
      return;
    }
    const signature = this.signatureRef && this.signatureRef.toDataURL();
    if (!signature) {
      this.setState({ documentError: "Signature required to proceed" });
      return;
    }
    this.props.onSubmit(signature);
  }

  private documents = () => ({
    [Documents.codeOfConduct]: {
      displayName: "Code of Conduct",
      name: Documents.codeOfConduct,
      render: this.getCodeOfConduct,
      value: this.state.acceptCodeOfConduct,
      validate: (val: boolean) => !!val,
      error: "You must accept to continue",
      label: "I have read and agree to abide by the Manchester Makerspace Code of Conduct",
    },
    [Documents.memberContract]: {
      displayName: "Member Contract",
      name: Documents.memberContract,
      render: this.getMemberContract,
      value: this.state.acceptMemberContract,
      validate: (val: boolean) => !!val,
      error: "You must accept to continue",
      label: "I have read and agree to the Manchester Makerspace Member Contract",
    }
  })
  private renderDocument = (documentString: string) => (
    <div dangerouslySetInnerHTML={{ __html: documentString }} />
  )
  public render() {
    const activeDisplay = this.documents()[this.state.display];
    return activeDisplay.render();
    // return (
    //   <>
    //     <Tabs
    //       value={activeDisplay.name}
    //       indicatorColor="primary"
    //       fullWidth={true}
    //       textColor="primary"
    //       style={{ marginBottom: "1em" }}
    //     >
    //       {Object.values(this.documents()).map(document => (
    //         <Tab
    //           label={document.displayName}
    //           value={document.name}
    //           key={document.name}
    //         />
    //       ))}
    //     </Tabs>
    //     { activeDisplay.render()}

    //   </>
    // );
  }
}

export default SignDocuments;