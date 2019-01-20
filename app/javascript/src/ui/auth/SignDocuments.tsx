import * as React from "react";

import SignatureCanvas from "react-signature-canvas";

import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { uploadMemberSignature } from "api/members/transactions";
import { AuthMember } from "ui/auth/interfaces";
import { timeToDate } from "ui/utils/timeToDate";
import Form from "ui/common/Form";

const codeOfConduct = require('code_of_conduct.html') as string;
const memberContract = require('member_contract.html') as string;

interface OwnProps {
  onSubmit: () => void;
  uploadError?: string;
  uploadProcessing?: boolean;
  currentUser: AuthMember;
}
interface Props extends OwnProps {}

interface State {
  display: Documents;
  acceptCodeOfConduct: boolean;
  acceptMemberContract: boolean;
  documentError: string;
  signatureUploadError: string;
  signatureUploading: boolean;
}

enum Documents {
  codeOfConduct = "code-of-conduct",
  memberContract = "member-contract",
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
      documentError: "",
      signatureUploadError: "",
      signatureUploading: false,
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
                id={document.name}
                name={document.name}
                value={document.name}
                checked={document.value}
                onChange={this.acceptDocument(Documents.codeOfConduct)}
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
        loading={this.state.signatureUploading}
        onSubmit={this.completeDocuments}
        error={this.state.documentError || this.props.uploadError}
      >
        {this.renderDocument(formattedMemberContract)}
        <div key={document.name}>
          <FormControlLabel
            control={
              <Checkbox
                id={document.name}
                name={document.name}
                checked={document.value}
                value={document.name}
                onChange={this.acceptDocument(Documents.memberContract)}
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
                <Button variant="contained" color="secondary" onClick={this.clearSignature}>Reset Signature</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
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
    // Clear any errors if accepting the document
    if (checked) {
      this.setState({ documentError: "" });
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
    if (!this.signatureRef || this.signatureRef.isEmpty()) {
      this.setState({ documentError: "Signature required to proceed" });
      return;
    }
    const signature = this.signatureRef.toDataURL();
    try {
      this.setState({ signatureUploading: true });
      console.log(this.props.currentUser);
      console.log(this.props.currentUser.id);
      await uploadMemberSignature(this.props.currentUser && this.props.currentUser.id, signature);
      this.setState({ signatureUploading: false, signatureUploadError: "" });
    } catch (e) {
      this.setState({ signatureUploading: false, signatureUploadError: e });
    }
    this.props.onSubmit();
  }

  private documents = () => ({
    [Documents.codeOfConduct]: {
      displayName: "Code of Conduct",
      name: `${Documents.codeOfConduct}-checkbox`,
      render: this.getCodeOfConduct,
      value: this.state.acceptCodeOfConduct,
      validate: (val: boolean) => !!val,
      error: "You must accept to continue",
      label: "I have read and agree to abide by the Manchester Makerspace Code of Conduct",
    },
    [Documents.memberContract]: {
      displayName: "Member Contract",
      name: `${Documents.memberContract}-checkbox`,
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
  }
}

export default SignDocuments;